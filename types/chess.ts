
export type TournamentStatus = 'registration' | 'in_progress' | 'completed';
export type MatchResult = 'pending' | 'white' | 'black' | 'draw';

export interface Match {
  id: string;
  tournament_id: string;
  round: number;
  white_player_id: string | null;
  black_player_id: string | null;
  board_number: number;
  result: MatchResult;
  created_at: string;
}

export interface Player {
  id: string;
  tournament_id: string;
  name: string;
  email: string | null;
  club: string | null;
  rating: number;
  seed_number: number | null;
  points: number;
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  start_date: string | null;
  status: TournamentStatus;
  total_rounds: number;
  current_round: number;
  created_at: string;
}
