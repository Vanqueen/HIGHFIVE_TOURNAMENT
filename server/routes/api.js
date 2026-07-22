import { Router } from 'express';
import * as tournament from '../controllers/tournamentController.js';
import * as player from '../controllers/playerController.js';
import * as match from '../controllers/matchController.js';
import * as auth from '../controllers/authController.js';
import { optionalAuth, requireAuth, requireRole, csrfGuard } from '../middleware/auth.js';

const router = Router();

/* Toute requête est identifiée si un cookie de session valide existe,
   et toute écriture doit porter l'en-tête anti-CSRF. */
router.use(csrfGuard);
router.use(optionalAuth);

const organizerOnly = [requireAuth, requireRole('organizer')];
const playerOnly = [requireAuth, requireRole('player')];

/* ----------------------------- Auth ------------------------------- */
/* L'inscription publique ne crée que des comptes joueurs. */
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', auth.me);
router.patch('/auth/profile', requireAuth, auth.updateProfile);
router.post('/auth/password', requireAuth, auth.changePassword);

/* -------------------------- Organisateurs -------------------------- */
/* Seul un organisateur peut en coopter un autre : il n'existe aucune
   voie publique vers ce rôle. */
router.get('/organizers', ...organizerOnly, auth.listOrganizers);
router.post('/organizers', ...organizerOnly, auth.createOrganizer);
router.delete('/organizers/:id', ...organizerOnly, auth.deleteOrganizer);

/* --------------------------- Tournaments --------------------------- */
/* Lecture publique : la vitrine doit fonctionner sans compte. */
router.get('/tournaments', tournament.getAll);
router.get('/tournaments/mine', ...organizerOnly, tournament.getMine);
router.get('/tournaments/:id', tournament.getById);
router.post('/tournaments', ...organizerOnly, tournament.create);
router.patch('/tournaments/:id', ...organizerOnly, tournament.update);
/* Supprime aussi les joueurs et les parties du tournoi. */
router.delete('/tournaments/:id', ...organizerOnly, tournament.remove);

/* ----------------------- Inscriptions joueur ----------------------- */
router.get('/me/registrations', ...playerOnly, player.myRegistrations);
router.post('/tournaments/:id/register', ...playerOnly, player.registerSelf);
router.delete('/tournaments/:id/register', ...playerOnly, player.unregisterSelf);

/* ----------------------------- Players ----------------------------- */
router.get('/players', player.getByTournament);
router.get('/tournaments/:tournament_id/podium', player.getTop);
router.post('/players', ...organizerOnly, player.create);
router.patch('/players/:id', ...organizerOnly, player.update);
router.delete('/players/:id', ...organizerOnly, player.remove);

/* ----------------------------- Matches ----------------------------- */
router.get('/matches', match.getByTournament);
router.post('/matches/bulk', ...organizerOnly, match.bulkCreate);
router.patch('/matches/:id', ...organizerOnly, match.update);

export default router;
