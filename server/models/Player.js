import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  tournament_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  name: { type: String, required: true },
  email: String,
  club: String,
  rating: { type: Number, default: 0 },
  seed_number: Number,
  points: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Player', playerSchema);
