import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Player, Registration, Tournament } from '../types';
import type { PieceColor, PlayedGame } from '../components/Scoreboard';

export interface NextGame {
  tournament: Tournament;
  round: number;
  board: number;
  color: PieceColor;
  /* null en cas d'exempt (bye) : la ronde est appariée sans adversaire. */
  opponent: Player | null;
}

export interface TournamentBoard {
  registration: Registration;
  games: PlayedGame[];
  next: NextGame | null;
}

export interface PlayerBoard {
  boards: TournamentBoard[];
  open: Tournament[];
  /* La partie à jouer la plus proche, tous tournois confondus. */
  next: NextGame | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/* Assemble le tableau de bord du joueur à partir des routes existantes :
   ses inscriptions, puis pour chaque tournoi lancé les appariements et
   les joueurs, d'où l'on déduit couleur, adversaire et résultats. */
export function usePlayerBoard(): PlayerBoard {
  const [boards, setBoards] = useState<TournamentBoard[]>([]);
  const [open, setOpen] = useState<Tournament[]>([]);
  const [next, setNext] = useState<NextGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [registrations, allTournaments] = await Promise.all([
        api.registrations.mine(),
        api.tournaments.list(),
      ]);

      const joined = new Set(registrations.map((r) => r.tournament_id));
      setOpen(allTournaments.filter((t) => t.status === 'registration' && !joined.has(t.id)));

      const assembled = await Promise.all(
        registrations.map(async (registration) => {
          const tournament = registration.tournament;

          /* Rien à apparier tant que le tournoi n'a pas démarré. */
          if (!tournament || tournament.status === 'registration') {
            return { registration, games: [], next: null } as TournamentBoard;
          }

          try {
            const [matches, players] = await Promise.all([
              api.matches.list(tournament.id),
              api.players.list(tournament.id),
            ]);

            const mine = matches.filter(
              (m) => m.white_player_id === registration.id || m.black_player_id === registration.id
            );

            const games: PlayedGame[] = mine
              .filter((m) => m.result !== 'pending')
              .sort((a, b) => a.round - b.round)
              .map((m) => {
                const color: PieceColor = m.white_player_id === registration.id ? 'white' : 'black';
                const outcome =
                  m.result === 'draw' ? 'draw' : m.result === color ? 'win' : 'loss';
                return { round: m.round, color, outcome };
              });

            const pending = mine
              .filter((m) => m.result === 'pending')
              .sort((a, b) => a.round - b.round)[0];

            let upcoming: NextGame | null = null;
            if (pending) {
              const color: PieceColor = pending.white_player_id === registration.id ? 'white' : 'black';
              const opponentId =
                color === 'white' ? pending.black_player_id : pending.white_player_id;
              upcoming = {
                tournament,
                round: pending.round,
                board: pending.board_number,
                color,
                opponent: players.find((p) => p.id === opponentId) ?? null,
              };
            }

            return { registration, games, next: upcoming } as TournamentBoard;
          } catch {
            /* Un tournoi illisible ne doit pas vider tout le tableau. */
            return { registration, games: [], next: null } as TournamentBoard;
          }
        })
      );

      setBoards(assembled);
      setNext(assembled.map((b) => b.next).find(Boolean) ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { boards, open, next, loading, error, reload };
}
