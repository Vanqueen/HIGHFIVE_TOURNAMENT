import * as matchService from '../services/matchService.js';

export const getByTournament = async (req, res, next) => {
  try {
    res.json(await matchService.getByTournament(req.query.tournament_id));
  } catch (err) { next(err); }
};

export const bulkCreate = async (req, res, next) => {
  try {
    res.status(201).json(await matchService.bulkCreate(req.body));
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    res.json(await matchService.update(req.params.id, req.body));
  } catch (err) { next(err); }
};
