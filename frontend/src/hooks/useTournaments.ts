import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Tournament } from '../types';

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tournaments.list().then((data) => {
      setTournaments(data ?? []);
      setLoading(false);
    });
  }, []);

  return { tournaments, loading };
}
