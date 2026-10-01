import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { ROLES } from '../models/User.js';
import Tournament from '../models/Tournament.js';
import Player from '../models/Player.js';
import { getJwtSecret, TOKEN_TTL_SECONDS } from '../utils/authConfig.js';
import { sendPasswordResetCode, sendTempPassword } from './emailService.js';

const BCRYPT_ROUNDS = 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_CODE_TTL_MS = 10 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;
const RESET_CODE_MAX_ATTEMPTS = 5;

const fail = (message, status = 400) => Object.assign(new Error(message), { status });

/* Représentation publique : jamais de hash, jamais de _id brut. */
const fmt = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    email: obj.email,
    full_name: obj.full_name,
    role: obj.role,
    club: obj.club ?? null,
    rating: obj.rating ?? 0,
    organization: obj.organization ?? null,
    created_at: obj.created_at,
    last_login_at: obj.last_login_at ?? null,
  };
};

export const issueToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, getJwtSecret(), { expiresIn: TOKEN_TTL_SECONDS });

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
};

/* Fabrique commune aux deux voies de création de compte. Le rôle n'est
   jamais lu depuis le corps de la requête : chaque appelant le fixe. */
const createAccount = async ({ email, password, full_name, role, club, rating, organization, created_by, temp_password_used = false }) => {
  email = String(email ?? '').trim().toLowerCase();
  password = String(password ?? '');
  full_name = String(full_name ?? '').trim();

  if (!EMAIL_RE.test(email)) throw fail('Adresse e-mail invalide.');
  if (full_name.length < 2) throw fail('Le nom complet est requis.');
  if (password.length < 8) throw fail('Le mot de passe doit contenir au moins 8 caractères.');
  if (!ROLES.includes(role)) throw fail('Rôle invalide.');

  if (await User.exists({ email })) throw fail('Un compte existe déjà avec cette adresse e-mail.', 409);

  const doc = await User.create({
    email,
    password_hash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    full_name,
    role,
    club: role === 'player' ? club?.trim() || null : null,
    rating: role === 'player' ? Number(rating) || 0 : 0,
    organization: role === 'organizer' ? organization?.trim() || null : null,
    created_by: created_by ?? null,
    temp_password_used,
  });

  return fmt(doc);
};

/* Inscription publique : réservée aux joueurs. Les comptes organisateurs
   ne s'obtiennent que par cooptation (voir createOrganizer). */
export const register = async (data) => {
  const doc = await createAccount({ ...data, role: 'player', temp_password_used: true });
  await User.updateOne({ _id: doc.id }, { last_login_at: new Date() });
  return doc;
};

/* Cooptation : génère un mot de passe temporaire à transmettre au nouvel
   organisateur. Il devra le changer à sa première connexion. */
export const createOrganizer = async (data, creator) => {
  const initial_password = crypto.randomBytes(12).toString('base64url');
  const user = await createAccount({
    ...data,
    password: initial_password,
    role: 'organizer',
    created_by: creator.id,
    temp_password_used: false,
  });
  return { user, initial_password };
};

/* Amorçage : crée un organisateur sans cooptant. Réservé à la ligne de
   commande — aucune route HTTP n'expose cette fonction, sinon n'importe
   qui pourrait se fabriquer un compte organisateur. */
export const bootstrapOrganizer = async (data) => createAccount({ ...data, role: 'organizer' });

export const listOrganizers = async () => {
  const docs = await User.find({ role: 'organizer' }).sort({ created_at: 1 });
  return docs.map(fmt);
};

/* Retrait d'un organisateur. Trois refus, tous nécessaires :
   - se supprimer soi-même laisserait une session sans compte ;
   - supprimer le dernier organisateur fermerait la porte définitivement,
     puisque le rôle ne s'obtient que par cooptation ;
   - supprimer un organisateur qui possède encore des tournois les rendrait
     orphelins, donc modifiables par personne. */
export const deleteOrganizer = async (id, actor) => {
  if (id === actor.id) throw fail('Vous ne pouvez pas supprimer votre propre compte.', 409);

  const doc = await User.findById(id);
  if (!doc || doc.role !== 'organizer') throw fail('Organisateur introuvable.', 404);

  if ((await User.countDocuments({ role: 'organizer' })) <= 1) {
    throw fail('Impossible de supprimer le dernier organisateur de la plateforme.', 409);
  }

  const owned = await Tournament.countDocuments({ organizer_id: id });
  if (owned > 0) {
    throw fail(
      `Cet organisateur gère encore ${owned} tournoi${owned > 1 ? 's' : ''}. ` +
        'Supprimez-les ou transférez-les avant de retirer le compte.',
      409
    );
  }

  await User.findByIdAndDelete(id);
};

export const login = async (data) => {
  const email = String(data.email ?? '').trim().toLowerCase();
  const password = String(data.password ?? '');

  if (!email || !password) throw fail('E-mail et mot de passe requis.');

  const doc = await User.findOne({ email }).select('+password_hash +temp_password_used');

  const invalid = fail('E-mail ou mot de passe incorrect.', 401);
  if (!doc) {
    await bcrypt.compare(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
    throw invalid;
  }

  if (!(await bcrypt.compare(password, doc.password_hash))) throw invalid;

  /* Logique mdp temporaire : uniquement pour les comptes créés via
     registerAndJoin, identifiables par last_login_at === null.
     Les comptes d'inscription directe ont last_login_at renseigné
     dès la création, donc cette branche ne les touche jamais. */
  if (doc.last_login_at === null) {
    /* Mdp temporaire déjà consommé (changé) mais hash correspond encore :
       cas théoriquement impossible, on bloque par sécurité. */
    if (doc.temp_password_used) {
      throw fail('Ce mot de passe temporaire a déjà été utilisé. Connectez-vous avec votre nouveau mot de passe.', 401);
    }

    /* Première connexion avec mdp temporaire : on laisse passer
       et on demande le changement de mdp. */
    doc.last_login_at = new Date();
    await doc.save();
    return { ...fmt(doc), must_change_password: true };
  }

  /* Une reconnexion reste autorisée même si le mot de passe temporaire n'a
     pas encore été remplacé. Le champ temp_password_used vaut aussi false
     pour les comptes créés avec leur propre mot de passe, il ne doit donc
     pas servir à bloquer une nouvelle session. */
  doc.last_login_at = new Date();
  await doc.save();

  return { ...fmt(doc), must_change_password: false };
};

/* Inscription au tournoi depuis la landing page (utilisateur non connecté).
   Crée un compte joueur avec mdp temporaire à usage unique, inscrit au tournoi
   et envoie le mdp par email. */
export const registerAndJoin = async ({ email, full_name, club, rating, tournament_id }) => {
  email = String(email ?? '').trim().toLowerCase();
  full_name = String(full_name ?? '').trim();

  if (!EMAIL_RE.test(email)) throw fail('Adresse e-mail invalide.');
  if (full_name.length < 2) throw fail('Le nom complet est requis (minimum 2 caractères).');

  const tournament = await Tournament.findById(tournament_id);
  if (!tournament) throw fail('Tournoi introuvable.', 404);
  if (tournament.status === 'in_progress') throw fail('Ce tournoi est déjà en cours. Les inscriptions sont closes.', 409);
  if (tournament.status === 'completed') throw fail('Ce tournoi est terminé. Les inscriptions sont closes.', 409);

  /* Compte existant : on notifie sans créer de doublon. */
  if (await User.exists({ email })) {
    throw fail(
      'Un compte existe déjà avec cette adresse e-mail. Connectez-vous pour vous inscrire au tournoi. Si vous avez oublié votre mot de passe, modifiez-le depuis votre espace.',
      409
    );
  }

  /* Génère un mdp temporaire lisible : 3 groupes de 4 caractères alphanumériques. */
  const tempPassword = [
    crypto.randomBytes(3).toString('hex'),
    crypto.randomBytes(3).toString('hex'),
    crypto.randomBytes(3).toString('hex'),
  ].join('-');

  const userDoc = await User.create({
    email,
    password_hash: await bcrypt.hash(tempPassword, BCRYPT_ROUNDS),
    full_name,
    role: 'player',
    club: club?.trim() || null,
    rating: Number(rating) || 0,
    temp_password_used: false,
  });

  /* Inscription au tournoi. */
  await Player.create({
    tournament_id,
    user_id: userDoc._id,
    name: full_name,
    email,
    club: club?.trim() || null,
    rating: Number(rating) || 0,
    points: 0,
  });

  /* Envoi du mail — on ne bloque pas si ça échoue. */
  try {
    await sendTempPassword({ to: email, full_name, tournamentName: tournament.name, tempPassword });
  } catch (e) {
    console.error('[email] Échec envoi mdp temporaire:', e.message);
  }

  return fmt(userDoc);
};

export const getById = async (id) => fmt(await User.findById(id));

export const updateProfile = async (id, data) => {
  const patch = {};
  if (typeof data.full_name === 'string' && data.full_name.trim().length >= 2) {
    patch.full_name = data.full_name.trim();
  }
  if ('club' in data) patch.club = data.club?.trim() || null;
  if ('organization' in data) patch.organization = data.organization?.trim() || null;
  if ('rating' in data) patch.rating = Number(data.rating) || 0;

  const doc = await User.findByIdAndUpdate(id, patch, { returnDocument: 'after' });
  if (!doc) throw fail('Utilisateur introuvable.', 404);
  return fmt(doc);
};

export const changePassword = async (id, current_password, new_password) => {
  if (String(new_password ?? '').length < 8) {
    throw fail('Le nouveau mot de passe doit contenir au moins 8 caractères.');
  }
  const doc = await User.findById(id).select('+password_hash +temp_password_used');
  if (!doc) throw fail('Utilisateur introuvable.', 404);

  /* Mot de passe temporaire non encore remplacé : la session authentifiée
     a déjà validé ce mot de passe à la connexion. */
  if (!doc.temp_password_used) {
    doc.password_hash = await bcrypt.hash(String(new_password), BCRYPT_ROUNDS);
    doc.temp_password_used = true;
    await doc.save();
    return;
  }

  if (!(await bcrypt.compare(String(current_password ?? ''), doc.password_hash))) {
    throw fail('Mot de passe actuel incorrect.', 401);
  }
  doc.password_hash = await bcrypt.hash(String(new_password), BCRYPT_ROUNDS);
  await doc.save();
};

const resetDigest = (purpose, value) =>
  crypto.createHmac('sha256', getJwtSecret()).update(`${purpose}:${value}`).digest('hex');

const digestMatches = (expected, actual) => {
  const expectedBytes = Buffer.from(expected, 'hex');
  const actualBytes = Buffer.from(actual, 'hex');
  return expectedBytes.length === actualBytes.length && crypto.timingSafeEqual(expectedBytes, actualBytes);
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const genericResponse = { message: 'Si un compte correspond à cette adresse, un code de vérification vient d’être envoyé.' };
  if (!EMAIL_RE.test(normalizedEmail)) return genericResponse;

  const doc = await User.findOne({ email: normalizedEmail }).select('_id email full_name');
  if (!doc) return genericResponse;

  const now = Date.now();
  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = resetDigest(`code:${doc.id}`, code);
  const issued = await User.findOneAndUpdate(
    {
      _id: doc._id,
      $or: [
        { password_reset_requested_at: null },
        { password_reset_requested_at: { $lt: new Date(now - 60_000) } },
      ],
    },
    {
      $set: {
        password_reset_code_hash: codeHash,
        password_reset_code_expires_at: new Date(now + RESET_CODE_TTL_MS),
        password_reset_code_attempts: 0,
        password_reset_requested_at: new Date(now),
        password_reset_token_hash: null,
        password_reset_token_expires_at: null,
      },
    },
    { new: true }
  ).select('_id email full_name');
  if (!issued) return genericResponse;

  void sendPasswordResetCode({ to: issued.email, full_name: issued.full_name, code }).catch(async (err) => {
    await User.updateOne(
      { _id: issued._id, password_reset_code_hash: codeHash },
      { $set: {
        password_reset_code_hash: null,
        password_reset_code_expires_at: null,
        password_reset_requested_at: null,
      } }
    );
    console.error('[email] Échec envoi du code de réinitialisation:', err.message);
  });

  return genericResponse;
};

export const verifyPasswordResetCode = async (email, code) => {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const doc = await User.findOne({ email: normalizedEmail }).select(
    '+password_reset_code_hash +password_reset_code_expires_at +password_reset_code_attempts'
  );
  const invalid = () => fail('Code invalide ou expiré. Demandez un nouveau code.', 400);
  if (!doc || !doc.password_reset_code_hash || !doc.password_reset_code_expires_at) throw invalid();

  if (doc.password_reset_code_expires_at.getTime() <= Date.now() || doc.password_reset_code_attempts >= RESET_CODE_MAX_ATTEMPTS) {
    await User.updateOne(
      { _id: doc._id, password_reset_code_hash: doc.password_reset_code_hash },
      { $set: { password_reset_code_hash: null, password_reset_code_expires_at: null } }
    );
    throw invalid();
  }

  if (!digestMatches(doc.password_reset_code_hash, resetDigest(`code:${doc.id}`, String(code ?? '')))) {
    const update = { $inc: { password_reset_code_attempts: 1 } };
    if (doc.password_reset_code_attempts + 1 >= RESET_CODE_MAX_ATTEMPTS) {
      update.$set = { password_reset_code_hash: null, password_reset_code_expires_at: null };
    }
    await User.updateOne(
      {
        _id: doc._id,
        password_reset_code_hash: doc.password_reset_code_hash,
        password_reset_code_expires_at: { $gt: new Date() },
        password_reset_code_attempts: { $lt: RESET_CODE_MAX_ATTEMPTS },
      },
      update
    );
    throw invalid();
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const result = await User.updateOne(
    {
      _id: doc._id,
      password_reset_code_hash: doc.password_reset_code_hash,
      password_reset_code_expires_at: { $gt: new Date() },
      password_reset_code_attempts: { $lt: RESET_CODE_MAX_ATTEMPTS },
    },
    {
      $set: {
        password_reset_code_hash: null,
        password_reset_code_expires_at: null,
        password_reset_code_attempts: 0,
        password_reset_token_hash: resetDigest('token', resetToken),
        password_reset_token_expires_at: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    }
  );
  if (result.modifiedCount !== 1) throw invalid();
  return { reset_token: resetToken };
};

export const resetPassword = async (resetToken, newPassword) => {
  if (String(newPassword ?? '').length < 8) {
    throw fail('Le nouveau mot de passe doit contenir au moins 8 caractères.');
  }
  const token = String(resetToken ?? '');
  if (!/^[a-f0-9]{64}$/.test(token)) throw fail('Lien de réinitialisation invalide ou expiré.', 400);

  const result = await User.updateOne(
    {
      password_reset_token_hash: resetDigest('token', token),
      password_reset_token_expires_at: { $gt: new Date() },
    },
    {
      $set: {
        password_hash: await bcrypt.hash(String(newPassword), BCRYPT_ROUNDS),
        temp_password_used: true,
        password_reset_token_hash: null,
        password_reset_token_expires_at: null,
        password_reset_requested_at: null,
      },
    }
  );
  if (result.modifiedCount !== 1) throw fail('Lien de réinitialisation invalide ou expiré.', 400);
};
