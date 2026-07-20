import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { generateSwissPairing, resultToPoints } from '../lib/pairing';
import type { Match, Player, Tournament } from '../types';

export function useTournamentDetail(tournamentId: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [t, p, m] = await Promise.all([
      api.tournaments.get(tournamentId),
      api.players.list(tournamentId),
      api.matches.list(tournamentId),
    ]);
    setTournament(t);
    setPlayers(p ?? []);
    setMatches(m ?? []);
    setLoading(false);
  }, [tournamentId]);

  useEffect(() => { load(); }, [load]);

  const startTournament = async () => {
    if (!tournament || players.length < 2) return;
    await api.tournaments.update(tournamentId, { status: 'in_progress', current_round: 1 });
    await generateRound(tournamentId, 1, players, []);
    load();
  };

  const nextRound = async () => {
    if (!tournament) return;
    const next = tournament.current_round + 1;
    await api.tournaments.update(tournamentId, { current_round: next });
    await generateRound(tournamentId, next, players, matches);
    load();
  };

  const completeTournament = async () => {
    await api.tournaments.update(tournamentId, { status: 'completed' });
    load();
  };

  const setMatchResult = async (match: Match, result: Match['result']) => {
    await api.matches.update(match.id, { result });
    const updated = matches.map((m) => (m.id === match.id ? { ...match, result } : m));
    await recalculatePoints(tournamentId, updated);
    load();
  };

  return { tournament, players, matches, loading, load, startTournament, nextRound, completeTournament, setMatchResult };
}

async function generateRound(tournamentId: string, round: number, players: Player[], previousMatches: Match[]) {
  const pairings = generateSwissPairing({ players, previousMatches, round });
  const rows = pairings.map((p) => ({
    tournament_id: tournamentId,
    round,
    white_player_id: p.whiteId,
    black_player_id: p.blackId,
    board_number: p.boardNumber,
    result: p.blackId === null ? 'white' as const : 'pending' as const,
  }));
  if (rows.length) await api.matches.bulkCreate(rows);
}

async function recalculatePoints(tournamentId: string, allMatches: Match[]) {
  const players = await api.players.list(tournamentId);
  const points = new Map<string, number>();
  for (const p of players) points.set(p.id, 0);
  for (const m of allMatches) {
    if (m.result === 'pending') continue;
    const [w, b] = resultToPoints(m.result);
    if (m.white_player_id) points.set(m.white_player_id, (points.get(m.white_player_id) ?? 0) + w);
    if (m.black_player_id) points.set(m.black_player_id, (points.get(m.black_player_id) ?? 0) + b);
  }
  await Promise.all(players.map((p) => api.players.update(p.id, { points: points.get(p.id) ?? 0 })));
}
