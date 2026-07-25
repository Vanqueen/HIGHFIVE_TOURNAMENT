import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Player from '../models/Player.js';
import User from '../models/User.js';
import Tournament from '../models/Tournament.js';
import { sendTempPassword } from './emailService.js';

const BCRYPT_ROUNDS = 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Import en masse de joueurs dans un tournoi.
 * Pour chaque entrée :
 *  - si email fourni et compte existant → inscrit directement (sans recréer de compte)
 *  - si email fourni et pas de compte   → crée le compte avec mdp temporaire + envoie mail
 *  - si pas d'email                     → inscrit comme joueur anonyme (pas de compte)
 *
 * Retourne un rapport { created, linked, anonymous, skipped, errors }
 */
export const bulkImport = async (tournament_id, rows, actor) => {
  const tournament = await Tournament.findById(tournament_id);
  if (!tournament) throw Object.assign(new Error('Tournoi introuvable.'), { status: 404 });
  if (tournament.status !== 'registration') {
    throw Object.assign(new Error('Les inscriptions sont fermées.'), { status: 409 });
  }

  const report = { created: 0, linked: 0, anonymous: 0, skipped: 0, errors: [] };
  const seedBase = await Player.countDocuments({ tournament_id });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = String(row.name ?? row.nom ?? '').trim();
    const email = String(row.email ?? '').trim().toLowerCase() || null;
    const club = String(row.club ?? '').trim() || null;
    const rating = Number(row.rating ?? row.elo ?? row.classement ?? 0) || 0;

    if (!name || name.length < 2) {
      report.errors.push({ row: i + 1, reason: 'Nom manquant ou trop court.' });
      continue;
    }

    try {
      /* Vérifier si déjà inscrit (par email ou par nom+club) */
      if (email) {
        const existingPlayer = await Player.findOne({
          tournament_id,
          email,
        });
        if (existingPlayer) {
          report.skipped++;
          continue;
        }
      }

      let user_id = null;

      if (email && EMAIL_RE.test(email)) {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          /* Compte existant : on lie juste le joueur au compte */
          user_id = existingUser._id;
          report.linked++;
        } else {
          /* Nouveau compte : mdp temporaire + email */
          const tempPassword = [
            crypto.randomBytes(3).toString('hex'),
            crypto.randomBytes(3).toString('hex'),
            crypto.randomBytes(3).toString('hex'),
          ].join('-');

          const userDoc = await User.create({
            email,
            password_hash: await bcrypt.hash(tempPassword, BCRYPT_ROUNDS),
            full_name: name,
            role: 'player',
            club,
            rating,
            temp_password_used: false,
          });

          user_id = userDoc._id;
          report.created++;

          /* Envoi mail non bloquant */
          sendTempPassword({ to: email, full_name: name, tournamentName: tournament.name, tempPassword })
            .catch((e) => console.error(`[email] Échec pour ${email}:`, e.message));
        }
      } else {
        report.anonymous++;
      }

      await Player.create({
        tournament_id,
        user_id,
        name,
        email,
        club,
        rating,
        points: 0,
        seed_number: seedBase + i + 1,
      });
    } catch (err) {
      report.errors.push({ row: i + 1, name, reason: err.message });
    }
  }

  return report;
};
