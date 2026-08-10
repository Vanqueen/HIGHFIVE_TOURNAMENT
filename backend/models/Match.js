import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  tournament_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },

  /* 'qualifying' : ronde du système suisse, `round` est la ronde de la poule.
     'playoff'    : tour de l'arbre final, `round` est le tour (1 = premier),
                    et `board_number` sert d'emplacement dans l'arbre. */
  phase: { type: String, enum: ['qualifying', 'playoff'], default: 'qualifying', index: true },

  round: { type: Number, required: true },
  white_player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  black_player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  board_number: Number,
  result: { type: String, enum: ['pending', 'white', 'black', 'draw'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
});

matchSchema.index({ tournament_id: 1, round: 1 });
matchSchema.index({ tournament_id: 1, phase: 1 });

export default mongoose.model('Match', matchSchema);
