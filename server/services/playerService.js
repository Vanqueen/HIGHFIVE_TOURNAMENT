import Player from '../models/Player.js';

const fmt = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id.toString();
  obj.tournament_id = obj.tournament_id?.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const getByTournament = async (tournament_id) => {
  const docs = await Player.find({ tournament_id }).sort({ seed_number: 1 });
  return docs.map(fmt);
};

export const getTopByTournament = async (tournament_id, limit = 3) => {
  const docs = await Player.find({ tournament_id })
    .sort({ points: -1, rating: -1 })
    .limit(limit);
  return docs.map(fmt);
};

export const create = async (data) => {
  if (!data.name?.trim()) throw Object.assign(new Error('Le nom est requis'), { status: 400 });
  if (!data.tournament_id) throw Object.assign(new Error('tournament_id est requis'), { status: 400 });
  const doc = await Player.create(data);
  return fmt(doc);
};

export const update = async (id, data) => {
  const doc = await Player.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  if (!doc) throw Object.assign(new Error('Joueur introuvable'), { status: 404 });
  return fmt(doc);
};

export const remove = async (id) => {
  const doc = await Player.findByIdAndDelete(id);
  if (!doc) throw Object.assign(new Error('Joueur introuvable'), { status: 404 });
};
