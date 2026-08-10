import Tournament from '../models/Tournament.js';
import Player from '../models/Player.js';
import Match from '../models/Match.js';

const fmt = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id.toString();
  obj.organizer_id = obj.organizer_id?.toString() ?? null;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const getAll = async () => {
  const docs = await Tournament.find().sort({ created_at: -1 });
  return docs.map(fmt);
};

export const getById = async (id) => {
  const doc = await Tournament.findById(id);
  if (!doc) throw Object.assign(new Error('Tournoi introuvable'), { status: 404 });
  return fmt(doc);
};

export const getByOrganizer = async (organizer_id) => {
  const docs = await Tournament.find({ organizer_id }).sort({ created_at: -1 });
  return docs.map(fmt);
};

export const create = async (data, organizer_id) => {
  if (!data.name?.trim()) throw Object.assign(new Error('Le nom est requis'), { status: 400 });
  /* organizer_id vient du jeton, jamais du corps de la requête : sinon
     n'importe qui pourrait créer un tournoi au nom d'un autre. */
  const doc = await Tournament.create({ ...data, organizer_id });
  return fmt(doc);
};

export const update = async (id, data) => {
  const { organizer_id, ...patch } = data;
  const doc = await Tournament.findByIdAndUpdate(id, patch, { returnDocument: 'after' });
  if (!doc) throw Object.assign(new Error('Tournoi introuvable'), { status: 404 });
  return fmt(doc);
};

/* Suppression en cascade : un tournoi n'existe pas sans ses joueurs ni
   ses parties, les laisser derrière créerait des orphelins invisibles.
   Renvoie le décompte pour que l'interface puisse dire ce qui a disparu. */
export const remove = async (id) => {
  const doc = await Tournament.findById(id);
  if (!doc) throw Object.assign(new Error('Tournoi introuvable'), { status: 404 });

  const matches = await Match.deleteMany({ tournament_id: id });
  const players = await Player.deleteMany({ tournament_id: id });
  await Tournament.findByIdAndDelete(id);

  return { players: players.deletedCount, matches: matches.deletedCount };
};

/* Pool partagé : le club VIPP est un noyau interne d'organisateurs de
   confiance, cooptés. N'importe quel organisateur peut donc gérer
   n'importe quel tournoi (joueurs, rondes, résultats, suppression).
   On vérifie seulement que le tournoi existe et que l'utilisateur est
   bien organisateur — le rôle est déjà garanti par la route, on le
   revérifie par prudence. Le créateur reste tracé via organizer_id. */
export const assertOwnership = async (tournament_id, user) => {
  const doc = await Tournament.findById(tournament_id).select('organizer_id');
  if (!doc) throw Object.assign(new Error('Tournoi introuvable'), { status: 404 });
  if (user?.role !== 'organizer') {
    throw Object.assign(new Error('Réservé aux organisateurs.'), { status: 403 });
  }
  return doc;
};
