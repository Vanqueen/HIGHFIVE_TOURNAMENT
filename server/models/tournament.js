import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  /* Organisateur propriétaire. Nullable pour les tournois créés avant
     l'ajout de l'authentification : ils restent lisibles, mais aucun
     organisateur ne peut les modifier tant qu'ils ne sont pas rattachés. */
  organizer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  name: { type: String, required: true },
  location: String,
  description: String,
  start_date: String,
  status: { type: String, enum: ['registration', 'in_progress', 'completed'], default: 'registration' },

  /* 'swiss'         : une poule unique en système suisse, le classement fait foi.
     'swiss_playoff' : la même poule qualificative, puis les mieux classés
                       s'affrontent en élimination directe. */
  format: { type: String, enum: ['swiss', 'swiss_playoff'], default: 'swiss' },

  /* Nombre de qualifiés pour la phase finale. Puissance de 2, sinon
     l'arbre comporterait des trous. */
  qualifiers: { type: Number, default: 4 },

  /* Où en est le tournoi. 'playoff' n'est atteignable qu'en swiss_playoff. */
  phase: { type: String, enum: ['qualifying', 'playoff'], default: 'qualifying' },

  /* Tour courant de l'arbre final : 1 = premier tour, 0 = pas commencé. */
  playoff_round: { type: Number, default: 0 },

  total_rounds: { type: Number, default: 5 },
  current_round: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Tournament', tournamentSchema);
