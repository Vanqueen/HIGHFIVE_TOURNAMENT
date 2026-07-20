import Tournament from '../models/Tournament.js';

const fmt = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id.toString();
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

export const create = async (data) => {
  if (!data.name?.trim()) throw Object.assign(new Error('Le nom est requis'), { status: 400 });
  const doc = await Tournament.create(data);
  return fmt(doc);
};

export const update = async (id, data) => {
  const doc = await Tournament.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  if (!doc) throw Object.assign(new Error('Tournoi introuvable'), { status: 404 });
  return fmt(doc);
};
