import * as playerService from '../services/playerService.js';
import * as tournamentService from '../services/tournamentService.js';

export const getByTournament = async (req, res, next) => {
  try {
    res.json(await playerService.getByTournament(req.query.tournament_id));
  } catch (err) { next(err); }
};

export const getTop = async (req, res, next) => {
  try {
    res.json(await playerService.getTopByTournament(req.params.tournament_id, 3));
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    await tournamentService.assertOwnership(req.body.tournament_id, req.user);
    /* Un joueur ajouté à la main n'est rattaché à aucun compte. */
    res.status(201).json(await playerService.create({ ...req.body, user_id: null }));
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const player = await playerService.getById(req.params.id);
    await tournamentService.assertOwnership(player.tournament_id, req.user);
    res.json(await playerService.update(req.params.id, req.body));
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    const player = await playerService.getById(req.params.id);
    await tournamentService.assertOwnership(player.tournament_id, req.user);
    await playerService.remove(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
};

/* ---------------- Inscription depuis l'espace joueur ---------------- */

export const myRegistrations = async (req, res, next) => {
  try {
    res.json(await playerService.getByUser(req.user.id));
  } catch (err) { next(err); }
};

export const registerSelf = async (req, res, next) => {
  try {
    res.status(201).json(await playerService.registerSelf(req.params.id, req.user));
  } catch (err) { next(err); }
};

export const unregisterSelf = async (req, res, next) => {
  try {
    await playerService.unregisterSelf(req.params.id, req.user);
    res.status(204).end();
  } catch (err) { next(err); }
};
