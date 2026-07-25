import * as authService from '../services/authService.js';
import { getCookieName } from '../utils/authConfig.js';

const deny = (message, status) => Object.assign(new Error(message), { status });

/* Lit le cookie de session et attache req.user, sans jamais bloquer.
   Utile pour les routes publiques qui s'enrichissent si connecté. */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[getCookieName()];
    if (!token) return next();

    const payload = authService.verifyToken(token);
    if (!payload?.sub) return next();

    /* On relit l'utilisateur en base : si le compte a été supprimé ou son
       rôle modifié depuis l'émission du jeton, on ne s'y fie pas. */
    req.user = await authService.getById(payload.sub);
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.user) return next(deny('Authentification requise.', 401));
  next();
};

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(deny('Authentification requise.', 401));
    if (!roles.includes(req.user.role)) {
      return next(deny("Votre rôle ne permet pas d'effectuer cette action.", 403));
    }
    next();
  };

/* ------------------------------------------------------------------ */
/*  Garde CSRF                                                         */
/*  Le cookie de session part automatiquement avec toute requête, y     */
/*  compris celles déclenchées par un site tiers. On exige donc un      */
/*  en-tête personnalisé sur les écritures : un formulaire HTML ou une  */
/*  image cross-site ne peut pas en poser, et un fetch cross-origin qui */
/*  l'ajoute déclenche un préflight que notre CORS refuse.              */
/*  (SameSite sur le cookie est la seconde barrière.)                   */
/* ------------------------------------------------------------------ */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const csrfGuard = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
    return next(deny('Requête rejetée : en-tête X-Requested-With manquant.', 403));
  }
  next();
};
