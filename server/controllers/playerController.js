import * as playerService from '../services/playerService.js';

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
    res.status(201).json(await playerService.create(req.body));
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    res.json(await playerService.update(req.params.id, req.body));
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await playerService.remove(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
};
