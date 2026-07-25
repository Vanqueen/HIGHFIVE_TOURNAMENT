import mongoose from 'mongoose';

export const ROLES = ['player', 'organizer'];

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password_hash: { type: String, required: true, select: false },
  full_name: { type: String, required: true, trim: true },
  role: { type: String, enum: ROLES, required: true },

  /* Profil joueur (facultatif, complété à l'inscription ou plus tard) */
  club: { type: String, default: null },
  rating: { type: Number, default: 0 },

  /* Profil organisateur */
  organization: { type: String, default: null },

  /* Organisateur qui a coopté ce compte. Null pour les joueurs (inscription
     publique) et pour le tout premier organisateur, créé en ligne de
     commande via `npm run create-organizer`. */
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  /* true tant que le mot de passe temporaire n'a pas été changé */
  temp_password_used: { type: Boolean, default: false },

  created_at: { type: Date, default: Date.now },
  last_login_at: { type: Date, default: null },
});

export default mongoose.model('User', userSchema);
