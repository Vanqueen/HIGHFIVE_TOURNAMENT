import { Router } from 'express';
import * as tournament from '../controllers/tournamentController.js';
import * as player from '../controllers/playerController.js';
import * as match from '../controllers/matchController.js';

const router = Router();

// Tournaments
router.get('/tournaments', tournament.getAll);
router.post('/tournaments', tournament.create);
router.get('/tournaments/:id', tournament.getById);
router.patch('/tournaments/:id', tournament.update);

// Players
router.get('/players', player.getByTournament);
router.post('/players', player.create);
router.patch('/players/:id', player.update);
router.delete('/players/:id', player.remove);

// Top 3 players (podium)
router.get('/tournaments/:tournament_id/podium', player.getTop);

// Matches
router.get('/matches', match.getByTournament);
router.post('/matches/bulk', match.bulkCreate);
router.patch('/matches/:id', match.update);

export default router;
