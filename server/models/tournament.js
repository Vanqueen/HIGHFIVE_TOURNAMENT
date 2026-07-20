import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  description: String,
  start_date: String,
  status: { type: String, enum: ['registration', 'in_progress', 'completed'], default: 'registration' },
  total_rounds: { type: Number, default: 5 },
  current_round: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Tournament', tournamentSchema);
