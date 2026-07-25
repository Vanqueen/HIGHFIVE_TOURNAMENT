import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';

const fmt = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id.toString();
  obj.tournament_id = obj.tournament_id?.toString();
  obj.user_id = obj.user_id?.toString() ?? null;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const getByTournament = async (tournament_id) => {
  const docs = await Player.find({ tournament_id }).sort({ seed_number: 1 });
  return docs.map(fmt);
};

export const getTopByTournament = async (tournament_id, limit = 3) => {
  const docs = await Player.find({ tournament_id })
    .sort({ points: -1, rating: -1 })
    .limit(limit);
  return docs.map(fmt);
};

export const create = async (data) => {
  if (!data.name?.trim()) throw Object.assign(new Error('Le nom est requis'), { status: 400 });
  if (!data.tournament_id) throw Object.assign(new Error('tournament_id est requis'), { status: 400 });
  const doc = await Player.create(data);
  return fmt(doc);
};

export const update = async (id, data) => {
  const doc = await Player.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  if (!doc) throw Object.assign(new Error('Joueur introuvable'), { status: 404 });
  return fmt(doc);
};

export const remove = async (id) => {
  const doc = await Player.findByIdAndDelete(id);
  if (!doc) throw Object.assign(new Error('Joueur introuvable'), { status: 404 });
};

export const getById = async (id) => {
  const doc = await Player.findById(id);
  if (!doc) throw Object.assign(new Error('Joueur introuvable'), { status: 404 });
  return fmt(doc);
};

/* ------------------------------------------------------------------ */
/*  Inscription d'un joueur depuis son propre compte                   */
/* ------------------------------------------------------------------ */

/* Toutes les participations d'un compte, tournois inclus. */
export const getByUser = async (user_id) => {
  const docs = await Player.find({ user_id }).populate('tournament_id').sort({ created_at: -1 });
  return docs.map((doc) => {
    const tournament = doc.tournament_id;
    const entry = fmt(doc);
    /* populate() a remplacé l'id par le document : on rétablit l'id et
       on expose le tournoi à part. */
    entry.tournament_id = tournament?._id?.toString() ?? null;
    entry.tournament = tournament
      ? { ...tournament.toObject(), id: tournament._id.toString(), _id: undefined, __v: undefined }
      : null;
    return entry;
  });
};

export const registerSelf = async (tournament_id, user) => {
  const tournament = await Tournament.findById(tournament_id);
  if (!tournament) throw Object.assign(new Error('Tournoi introuvable'), { status: 404 });
  if (tournament.status !== 'registration') {
    throw Object.assign(new Error('Les inscriptions à ce tournoi sont fermées.'), { status: 409 });
  }

  if (await Player.exists({ tournament_id, user_id: user.id })) {
    throw Object.assign(new Error('Vous êtes déjà inscrit à ce tournoi.'), { status: 409 });
  }

  const doc = await Player.create({
    tournament_id,
    user_id: user.id,
    name: user.full_name,
    email: user.email,
    club: user.club ?? null,
    rating: user.rating ?? 0,
  });
  return fmt(doc);
};

export const unregisterSelf = async (tournament_id, user) => {
  const tournament = await Tournament.findById(tournament_id).select('status');
  if (!tournament) throw Object.assign(new Error('Tournoi introuvable'), { status: 404 });
  if (tournament.status !== 'registration') {
    throw Object.assign(
      new Error('Le tournoi a commencé : vous ne pouvez plus vous désinscrire.'),
      { status: 409 }
    );
  }

  const doc = await Player.findOneAndDelete({ tournament_id, user_id: user.id });
  if (!doc) throw Object.assign(new Error("Vous n'êtes pas inscrit à ce tournoi."), { status: 404 });
};
