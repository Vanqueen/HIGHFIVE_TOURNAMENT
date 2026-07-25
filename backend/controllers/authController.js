import * as authService from '../services/authService.js';
import { getCookieName, getCookieOptions, getClearCookieOptions } from '../utils/authConfig.js';

const openSession = (res, user) => {
  res.cookie(getCookieName(), authService.issueToken(user), getCookieOptions());
};

/* Inscription publique : toujours un compte joueur, quel que soit le
   contenu du corps de la requête. */
export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    openSession(res, user);
    res.status(201).json({ user });
  } catch (err) { next(err); }
};

/* Un organisateur en coopte un autre. Aucune session n'est ouverte ici :
   c'est le nouveau compte qui se connectera lui-même. */
export const createOrganizer = async (req, res, next) => {
  try {
    res.status(201).json({ user: await authService.createOrganizer(req.body, req.user) });
  } catch (err) { next(err); }
};

export const listOrganizers = async (req, res, next) => {
  try {
    res.json(await authService.listOrganizers());
  } catch (err) { next(err); }
};

export const deleteOrganizer = async (req, res, next) => {
  try {
    await authService.deleteOrganizer(req.params.id, req.user);
    res.status(204).end();
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const user = await authService.login(req.body);
    openSession(res, user);
    res.json({ user });
  } catch (err) { next(err); }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie(getCookieName(), getClearCookieOptions());
    res.status(204).end();
  } catch (err) { next(err); }
};

/* Appelé au démarrage du front pour restaurer la session.
   Répond 200 avec user: null plutôt que 401 : ne pas être connecté
   n'est pas une erreur au chargement de la page. */
export const me = async (req, res, next) => {
  try {
    res.json({ user: req.user ?? null });
  } catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try {
    res.json({ user: await authService.updateProfile(req.user.id, req.body) });
  } catch (err) { next(err); }
};

export const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user.id, req.body.current_password, req.body.new_password);
    res.status(204).end();
  } catch (err) { next(err); }
};

export const registerAndJoin = async (req, res, next) => {
  try {
    const user = await authService.registerAndJoin({
      ...req.body,
      tournament_id: req.params.tournamentId,
    });
    res.status(201).json({ user });
  } catch (err) { next(err); }
};
