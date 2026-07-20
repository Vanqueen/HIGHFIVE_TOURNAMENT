import Match from '../models/Match.js';

const fmt = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id.toString();
  obj.tournament_id = obj.tournament_id?.toString();
  if (obj.white_player_id) obj.white_player_id = obj.white_player_id.toString();
  if (obj.black_player_id) obj.black_player_id = obj.black_player_id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const getByTournament = async (tournament_id) => {
  const docs = await Match.find({ tournament_id }).sort({ round: 1 });
  return docs.map(fmt);
};

export const bulkCreate = async (rows) => {
  if (!Array.isArray(rows) || rows.length === 0)
    throw Object.assign(new Error('Tableau de matchs vide'), { status: 400 });
  const docs = await Match.insertMany(rows);
  return docs.map(fmt);
};

export const update = async (id, data) => {
  const doc = await Match.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  if (!doc) throw Object.assign(new Error('Match introuvable'), { status: 404 });
  return fmt(doc);
};
