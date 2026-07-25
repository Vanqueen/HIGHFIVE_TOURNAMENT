import * as matchService from '../services/matchService.js';
import * as tournamentService from '../services/tournamentService.js';

export const getByTournament = async (req, res, next) => {
  try {
    res.json(await matchService.getByTournament(req.query.tournament_id));
  } catch (err) { next(err); }
};

export const bulkCreate = async (req, res, next) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [];
    /* Tous les matchs d'un appel doivent viser le même tournoi, sinon on
       ne pourrait pas vérifier la propriété de façon fiable. */
    const ids = [...new Set(rows.map((row) => String(row?.tournament_id ?? '')))];
    if (ids.length !== 1 || !ids[0]) {
      throw Object.assign(new Error("Tous les matchs doivent appartenir au même tournoi."), { status: 400 });
    }
    await tournamentService.assertOwnership(ids[0], req.user);
    res.status(201).json(await matchService.bulkCreate(rows));
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const match = await matchService.getById(req.params.id);
    await tournamentService.assertOwnership(match.tournament_id, req.user);
    res.json(await matchService.update(req.params.id, req.body));
  } catch (err) { next(err); }
};
