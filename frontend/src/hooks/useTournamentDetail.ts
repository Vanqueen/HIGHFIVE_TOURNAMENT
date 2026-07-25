import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { generateSwissPairing, resultToPoints } from '../lib/pairing';
import {
  bracketRounds,
  firstBracketRound,
  nextBracketRound,
  qualifiedPlayers,
  type BracketPairing,
} from '../lib/bracket';
import type { Match, Player, Tournament } from '../types';

export function useTournamentDetail(tournamentId: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    load();
  }, [load]);

  /* Enveloppe commune : un seul verrou, et les erreurs remontent à l'écran
     au lieu de disparaître dans la console. */
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible.');
    } finally {
      setBusy(false);
    }
  };

  /* ------------------------ phase qualificative ------------------------ */

  const startTournament = () =>
    run(async () => {
      if (!tournament || players.length < 2) return;
      await api.tournaments.update(tournamentId, {
        status: 'in_progress',
        phase: 'qualifying',
        current_round: 1,
      });
      await generateQualifyingRound(tournamentId, 1, players, []);
    });

  const nextRound = () =>
    run(async () => {
      if (!tournament) return;
      const next = tournament.current_round + 1;
      await api.tournaments.update(tournamentId, { current_round: next });
      await generateQualifyingRound(tournamentId, next, players, matches);
    });

  /* -------------------------- phase finale ---------------------------- */

  const startPlayoff = () =>
    run(async () => {
      if (!tournament) return;
      const qualified = qualifiedPlayers(players, tournament.qualifiers);
      if (qualified.length < tournament.qualifiers) {
        throw new Error(
          `Il faut ${tournament.qualifiers} joueurs classés pour lancer la phase finale, ${qualified.length} disponibles.`
        );
      }
      await api.tournaments.update(tournamentId, { phase: 'playoff', playoff_round: 1 });
      await createPlayoffMatches(tournamentId, firstBracketRound(qualified));
    });

  const nextPlayoffRound = () =>
    run(async () => {
      if (!tournament) return;
      const next = tournament.playoff_round + 1;
      if (next > bracketRounds(tournament.qualifiers)) return;

      const current = matches.filter((m) => m.phase === 'playoff' && m.round === tournament.playoff_round);
      await api.tournaments.update(tournamentId, { playoff_round: next });
      await createPlayoffMatches(tournamentId, nextBracketRound(current, next));
    });

  const completeTournament = () =>
    run(async () => {
      await api.tournaments.update(tournamentId, { status: 'completed' });
    });

  const setMatchResult = (match: Match, result: Match['result']) =>
    run(async () => {
      await api.matches.update(match.id, { result });
      const updated = matches.map((m) => (m.id === match.id ? { ...match, result } : m));
      await recalculatePoints(tournamentId, updated);
    });

  return {
    tournament,
    players,
    matches,
    loading,
    busy,
    error,
    load,
    startTournament,
    nextRound,
    startPlayoff,
    nextPlayoffRound,
    completeTournament,
    setMatchResult,
  };
}

async function generateQualifyingRound(
  tournamentId: string,
  round: number,
  players: Player[],
  previousMatches: Match[]
) {
  /* Le suisse n'apparie que sur l'historique de la poule. */
  const history = previousMatches.filter((m) => m.phase !== 'playoff');
  const pairings = generateSwissPairing({ players, previousMatches: history, round });

  const rows = pairings.map((p) => ({
    tournament_id: tournamentId,
    phase: 'qualifying' as const,
    round,
    white_player_id: p.whiteId,
    black_player_id: p.blackId,
    board_number: p.boardNumber,
    result: p.blackId === null ? ('white' as const) : ('pending' as const),
  }));
  if (rows.length) await api.matches.bulkCreate(rows);
}

async function createPlayoffMatches(tournamentId: string, pairings: BracketPairing[]) {
  const rows = pairings.map((p) => ({
    tournament_id: tournamentId,
    phase: 'playoff' as const,
    round: p.round,
    white_player_id: p.whiteId,
    black_player_id: p.blackId,
    /* L'emplacement dans l'arbre voyage dans board_number. */
    board_number: p.slot,
    result: 'pending' as const,
  }));
  if (rows.length) await api.matches.bulkCreate(rows);
}

/* Les points sont le score de la poule qualificative : une victoire en
   phase finale ne doit pas modifier le classement qui a servi à qualifier. */
async function recalculatePoints(tournamentId: string, allMatches: Match[]) {
  const players = await api.players.list(tournamentId);
  const points = new Map<string, number>();
  for (const p of players) points.set(p.id, 0);

  for (const m of allMatches) {
    if (m.phase === 'playoff' || m.result === 'pending') continue;
    const [w, b] = resultToPoints(m.result);
    if (m.white_player_id) points.set(m.white_player_id, (points.get(m.white_player_id) ?? 0) + w);
    if (m.black_player_id) points.set(m.black_player_id, (points.get(m.black_player_id) ?? 0) + b);
  }

  await Promise.all(players.map((p) => api.players.update(p.id, { points: points.get(p.id) ?? 0 })));
}
