export type TournamentStatus = 'registration' | 'in_progress' | 'completed';
export type MatchResult = 'pending' | 'white' | 'black' | 'draw';

/* 'swiss'         : une poule unique en système suisse, le classement fait foi.
   'swiss_playoff' : la même poule qualificative, puis élimination directe
                     entre les mieux classés. */
export type TournamentFormat = 'swiss' | 'swiss_playoff';

/* Phase courante d'un tournoi, et phase à laquelle appartient une partie. */
export type Phase = 'qualifying' | 'playoff';

/* Deux rôles pour l'instant :
   - player    : s'inscrit aux tournois et suit ses parties
   - organizer : crée les tournois, gère joueurs, rondes et résultats */
export type Role = 'player' | 'organizer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  club: string | null;
  rating: number;
  organization: string | null;
  created_at: string;
  last_login_at?: string | null;
}

export interface Tournament {
  id: string;
  organizer_id: string | null;
  name: string;
  location: string | null;
  description: string | null;
  start_date: string | null;
  status: TournamentStatus;
  format: TournamentFormat;
  /* Nombre de qualifiés pour la phase finale — puissance de 2. */
  qualifiers: number;
  phase: Phase;
  /* Tour courant de l'arbre final, 0 tant qu'il n'a pas commencé. */
  playoff_round: number;
  total_rounds: number;
  current_round: number;
  created_at: string;
}

export interface Player {
  id: string;
  tournament_id: string;
  /* Non nul quand le joueur s'est inscrit depuis son propre compte. */
  user_id: string | null;
  name: string;
  email: string | null;
  club: string | null;
  rating: number;
  seed_number: number | null;
  points: number;
  created_at: string;
}

/* Une participation renvoyée par /me/registrations : la ligne joueur
   accompagnée du tournoi correspondant. */
export interface Registration extends Player {
  tournament: Tournament | null;
}

export interface Match {
  id: string;
  tournament_id: string;
  phase: Phase;
  /* Ronde de la poule en qualification, tour de l'arbre en phase finale. */
  round: number;
  white_player_id: string | null;
  black_player_id: string | null;
  board_number: number;
  result: MatchResult;
  created_at: string;
}

export type View =
  | { name: 'landing' }
  | { name: 'auth' }
  | { name: 'dashboard' }
  | { name: 'list' }
  | { name: 'create' }
  | { name: 'detail'; tournamentId: string }
  | { name: 'standings'; tournamentId: string };
