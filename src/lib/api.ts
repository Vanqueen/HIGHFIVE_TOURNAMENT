import type { Tournament, Player, Match, Registration, User } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api';

/* Erreur enrichie du code HTTP : les écrans peuvent distinguer un 401
   (session expirée) d'un 409 (déjà inscrit) sans analyser le message. */
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    /* La session vit dans un cookie httpOnly : il faut l'envoyer
       explicitement puisque l'API est sur une autre origine que le front. */
    credentials: 'include',
    headers: {
      /* Exigé par la garde anti-CSRF du serveur sur toute écriture. */
      'X-Requested-With': 'XMLHttpRequest',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error ?? res.statusText, res.status);
  return json as T;
}

/* L'inscription publique ne crée que des comptes joueurs : le rôle n'est
   donc pas un paramètre, le serveur le fixe lui-même. */
export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  club?: string;
}

export interface NewOrganizerPayload {
  email: string;
  password: string;
  full_name: string;
  organization?: string;
}

export const api = {
  auth: {
    register: (body: RegisterPayload) => req<{ user: User }>('POST', '/auth/register', body),
    login: (email: string, password: string) =>
      req<{ user: User }>('POST', '/auth/login', { email, password }),
    logout: () => req<void>('POST', '/auth/logout', {}),
    me: () => req<{ user: User | null }>('GET', '/auth/me'),
    updateProfile: (body: Partial<Pick<User, 'full_name' | 'club' | 'organization' | 'rating'>>) =>
      req<{ user: User }>('PATCH', '/auth/profile', body),
    changePassword: (current_password: string, new_password: string) =>
      req<void>('POST', '/auth/password', { current_password, new_password }),
    registerAndJoin: (tournamentId: string, body: { email: string; full_name: string; club?: string; rating?: number }) =>
      req<{ user: User }>('POST', `/auth/register-and-join/${tournamentId}`, body),
  },
  /* Cooptation : réservé aux organisateurs connectés. */
  organizers: {
    list: () => req<User[]>('GET', '/organizers'),
    create: (body: NewOrganizerPayload) => req<{ user: User }>('POST', '/organizers', body),
    delete: (id: string) => req<void>('DELETE', `/organizers/${id}`),
  },
  tournaments: {
    list: () => req<Tournament[]>('GET', '/tournaments'),
    /* Tournois dont l'utilisateur connecté est l'organisateur. */
    mine: () => req<Tournament[]>('GET', '/tournaments/mine'),
    get: (id: string) => req<Tournament>('GET', `/tournaments/${id}`),
    create: (body: Partial<Tournament>) => req<Tournament>('POST', '/tournaments', body),
    update: (id: string, body: Partial<Tournament>) => req<Tournament>('PATCH', `/tournaments/${id}`, body),
    /* Renvoie ce qui a été emporté par la cascade. */
    delete: (id: string) => req<{ players: number; matches: number }>('DELETE', `/tournaments/${id}`),
  },
  registrations: {
    mine: () => req<Registration[]>('GET', '/me/registrations'),
    join: (tournament_id: string) => req<Player>('POST', `/tournaments/${tournament_id}/register`, {}),
    leave: (tournament_id: string) => req<void>('DELETE', `/tournaments/${tournament_id}/register`),
  },
  players: {
    list: (tournament_id: string) => req<Player[]>('GET', `/players?tournament_id=${tournament_id}`),
    create: (body: Partial<Player>) => req<Player>('POST', '/players', body),
    update: (id: string, body: Partial<Player>) => req<Player>('PATCH', `/players/${id}`, body),
    delete: (id: string) => req<void>('DELETE', `/players/${id}`),
    bulkImport: (tournament_id: string, players: unknown[]) =>
      req<{ created: number; linked: number; anonymous: number; skipped: number; errors: { row: number; name?: string; reason: string }[] }>(
        'POST', `/tournaments/${tournament_id}/players/import`, { players }
      ),
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
