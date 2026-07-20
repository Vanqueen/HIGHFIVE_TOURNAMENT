const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api';

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? res.statusText);
  return json as T;
}

export const api = {
  tournaments: {
    list: () => req<Tournament[]>('GET', '/tournaments'),
    get: (id: string) => req<Tournament>('GET', `/tournaments/${id}`),
    create: (body: Partial<Tournament>) => req<Tournament>('POST', '/tournaments', body),
    update: (id: string, body: Partial<Tournament>) => req<Tournament>('PATCH', `/tournaments/${id}`, body),
  },
  players: {
    list: (tournament_id: string) => req<Player[]>('GET', `/players?tournament_id=${tournament_id}`),
    create: (body: Partial<Player>) => req<Player>('POST', '/players', body),
    update: (id: string, body: Partial<Player>) => req<Player>('PATCH', `/players/${id}`, body),
    delete: (id: string) => req<void>('DELETE', `/players/${id}`),
  },
  podium: {
    get: (tournament_id: string) => req<Player[]>('GET', `/tournaments/${tournament_id}/podium`),
  },
  matches: {
    list: (tournament_id: string) => req<Match[]>('GET', `/matches?tournament_id=${tournament_id}`),
    bulkCreate: (rows: Partial<Match>[]) => req<Match[]>('POST', '/matches/bulk', rows),
    update: (id: string, body: Partial<Match>) => req<Match>('PATCH', `/matches/${id}`, body),
  },
};

export type TournamentStatus = 'registration' | 'in_progress' | 'completed';
export type MatchResult = 'pending' | 'white' | 'black' | 'draw';

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
