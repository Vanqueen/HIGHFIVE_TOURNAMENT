import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  tournament_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  round: { type: Number, required: true },
  white_player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  black_player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  board_number: Number,
  result: { type: String, enum: ['pending', 'white', 'black', 'draw'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Match', matchSchema);
