import type { Match, MatchResult, Player } from './supabase';

// Swiss-system pairing engine for over-the-board chess tournaments.
// Implements: score-bucket pairing, avoids repeat opponents, assigns colors
// to balance white/black, and handles odd numbers of players with a bye.

interface PairingInput {
  players: Player[];
  previousMatches: Match[];
  round: number;
}

interface PairingOutput {
  whiteId: string;
  blackId: string | null; // null => bye
  boardNumber: number;
}

function havePlayed(a: string, b: string, matches: Match[]): boolean {
  return matches.some(
    (m) =>
      (m.white_player_id === a && m.black_player_id === b) ||
      (m.white_player_id === b && m.black_player_id === a),
  );
}

function colorCount(playerId: string, matches: Match[], color: 'white' | 'black'): number {
  return matches.filter((m) => m[`${color}_player_id`] === playerId).length;
}

export function generateSwissPairing({
  players,
  previousMatches,
  round,
}: PairingInput): PairingOutput[] {
  const active = players.filter((p) => p !== undefined);
  if (active.length === 0) return [];

  // Sort by points desc, then rating desc — standard Swiss seeding.
  const ranked = [...active].sort(
    (a, b) => Number(b.points) - Number(a.points) || b.rating - a.rating,
  );

  const paired = new Set<string>();
  const pairings: PairingOutput[] = [];
  let board = 1;

  for (let i = 0; i < ranked.length; i++) {
    const p = ranked[i];
    if (paired.has(p.id)) continue;

    let opponent: Player | null = null;
    for (let j = i + 1; j < ranked.length; j++) {
      const c = ranked[j];
      if (paired.has(c.id)) continue;
      if (havePlayed(p.id, c.id, previousMatches)) continue;
      opponent = c;
      break;
    }

    if (!opponent) {
      // Bye — player sits out this round and scores a point.
      pairings.push({ whiteId: p.id, blackId: null, boardNumber: board++ });
      paired.add(p.id);
      continue;
    }

    // Assign colors to balance white/black counts.
    const pWhite = colorCount(p.id, previousMatches, 'white');
    const pBlack = colorCount(p.id, previousMatches, 'black');
    const oWhite = colorCount(opponent.id, previousMatches, 'white');
    const oBlack = colorCount(opponent.id, previousMatches, 'black');

    let white = p;
    let black = opponent;
    // Player with fewer whites gets white; if tied, higher-seeded player gets white.
    if (pWhite > oWhite) {
      white = opponent;
      black = p;
    } else if (pWhite === oWhite && pBlack < oBlack) {
      white = opponent;
      black = p;
    }

    pairings.push({ whiteId: white.id, blackId: black.id, boardNumber: board++ });
    paired.add(p.id);
    paired.add(opponent.id);
  }

  return pairings;
}

export function resultToPoints(result: MatchResult): [number, number] {
  switch (result) {
    case 'white':
      return [1, 0];
    case 'black':
      return [0, 1];
    case 'draw':
      return [0.5, 0.5];
    default:
      return [0, 0];
  }
}
