import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Tournament } from '../types';

export interface TournamentDesk {
  tournament: Tournament;
  players: number;
}

/* Pool partagé : tous les tournois de la plateforme, avec leur nombre
   d'inscrits. Chaque organisateur peut gérer n'importe lequel. */
export function useOrganizerBoard() {
  const [desks, setDesks] = useState<TournamentDesk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const tournaments = await api.tournaments.list();

      const assembled = await Promise.all(
        tournaments.map(async (tournament) => {
          try {
            return { tournament, players: (await api.players.list(tournament.id)).length };
          } catch {
            /* Un tournoi illisible reste listé, sans compteur. */
            return { tournament, players: 0 };
          }
        })
      );

      setDesks(assembled);
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

  return { desks, loading, error, reload };
}
