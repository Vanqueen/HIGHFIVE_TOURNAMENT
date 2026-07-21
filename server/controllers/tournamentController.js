import * as tournamentService from '../services/tournamentService.js';

export const getAll = async (req, res, next) => {
  try {
    res.json(await tournamentService.getAll());
  } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
  try {
    res.json(await tournamentService.getById(req.params.id));
  } catch (err) { next(err); }
};

/* Tournois dont l'utilisateur connecté est l'organisateur. */
export const getMine = async (req, res, next) => {
  try {
    res.json(await tournamentService.getByOrganizer(req.user.id));
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    res.status(201).json(await tournamentService.create(req.body, req.user.id));
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    await tournamentService.assertOwnership(req.params.id, req.user);
    res.json(await tournamentService.update(req.params.id, req.body));
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await tournamentService.assertOwnership(req.params.id, req.user);
    res.json(await tournamentService.remove(req.params.id));
  } catch (err) { next(err); }
};
