import type { Tournament, Player, Match } from '../types';

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
