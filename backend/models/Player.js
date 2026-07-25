import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  tournament_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  /* Renseigné quand le joueur s'est inscrit lui-même depuis son compte.
     Reste null pour les joueurs saisis à la main par l'organisateur. */
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  name: { type: String, required: true },
  email: String,
  club: String,
  rating: { type: Number, default: 0 },
  seed_number: Number,
  points: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

/* Un compte ne peut s'inscrire qu'une fois par tournoi. Le filtre partiel
   laisse coexister autant de joueurs « manuels » (user_id null) que voulu. */
playerSchema.index(
  { tournament_id: 1, user_id: 1 },
  { unique: true, partialFilterExpression: { user_id: { $type: 'objectId' } } }
);

export default mongoose.model('Player', playerSchema);
