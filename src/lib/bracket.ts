import type { Match, Player, Tournament } from '../types';

/* ------------------------------------------------------------------ */
/*  Phase finale à élimination directe.                                */
/*                                                                     */
/*  La poule qualificative se joue au système suisse ; à son terme, les */
/*  N mieux classés entrent dans un arbre. Un tour = une colonne de     */
/*  l'arbre ; le vainqueur d'un emplacement monte à l'emplacement       */
/*  ceil(s / 2) du tour suivant.                                        */
/* ------------------------------------------------------------------ */

/* Tailles d'arbre admissibles : sans puissance de 2, l'arbre aurait des
   trous et certains qualifiés sauteraient un tour sans le mériter. */
export const BRACKET_SIZES = [2, 4, 8, 16, 32] as const;

export const isBracketSize = (n: number) => BRACKET_SIZES.includes(n as (typeof BRACKET_SIZES)[number]);

/* Nombre de tours nécessaires : 8 qualifiés → 3 tours (quarts, demies, finale). */
export const bracketRounds = (qualifiers: number) => Math.log2(qualifiers);

/* Nom consacré d'un tour, compté depuis la finale. */
export function roundLabel(qualifiers: number, round: number) {
  const remaining = qualifiers / 2 ** (round - 1);
  switch (remaining) {
    case 2:
      return 'Finale';
    case 4:
      return 'Demi-finales';
    case 8:
      return 'Quarts de finale';
    case 16:
      return 'Huitièmes de finale';
    case 32:
      return 'Seizièmes de finale';
    default:
      return `Tour ${round}`;
  }
}

/* Version courte, pour les sélecteurs de ronde où la place manque. */
export function shortRoundLabel(qualifiers: number, round: number) {
  const remaining = qualifiers / 2 ** (round - 1);
  switch (remaining) {
    case 2:
      return 'Finale';
    case 4:
      return '½ finales';
    case 8:
      return '¼ finales';
    case 16:
      return '8es';
    case 32:
      return '16es';
    default:
      return `T${round}`;
  }
}

/* Ordre des têtes de série dans l'arbre. Construction récursive classique :
   à chaque doublement, chaque graine s est suivie de son complément.
   Résultat pour 8 : 1-8, 4-5, 2-7, 3-6 — la tête de série n°1 et la n°2
   ne peuvent se rencontrer qu'en finale. */
export function seedOrder(size: number): number[] {
  let order = [1, 2];
  while (order.length < size) {
    const doubled = order.length * 2;
    const next: number[] = [];
    for (const seed of order) {
      next.push(seed, doubled + 1 - seed);
    }
    order = next;
  }
  return order;
}

/* Classement de la poule qualificative : points, puis Elo pour départager.
   C'est ce classement qui détermine les têtes de série de l'arbre. */
export function qualifyingStandings(players: Player[]): Player[] {
  return [...players].sort(
    (a, b) => Number(b.points) - Number(a.points) || b.rating - a.rating || a.name.localeCompare(b.name)
  );
}

/* Les joueurs qualifiés, dans l'ordre de leur tête de série. */
export function qualifiedPlayers(players: Player[], qualifiers: number): Player[] {
  return qualifyingStandings(players).slice(0, qualifiers);
}

export interface BracketPairing {
  round: number;
  slot: number;
  whiteId: string | null;
  blackId: string | null;
}

/* Premier tour : on place les qualifiés selon l'ordre des têtes de série.
   La mieux classée des deux prend les blancs, avantage traditionnel. */
export function firstBracketRound(qualified: Player[]): BracketPairing[] {
  const order = seedOrder(qualified.length);
  const pairings: BracketPairing[] = [];

  for (let i = 0; i < order.length; i += 2) {
    const high = qualified[order[i] - 1];
    const low = qualified[order[i + 1] - 1];
    pairings.push({
      round: 1,
      slot: i / 2 + 1,
      whiteId: high?.id ?? null,
      blackId: low?.id ?? null,
    });
  }
  return pairings;
}

export const matchWinnerId = (match: Match): string | null => {
  if (match.result === 'white') return match.white_player_id;
  if (match.result === 'black') return match.black_player_id;
  /* Une nulle ne départage pas : en élimination directe, l'organisateur
     saisit le vainqueur du départage (blitz, Armageddon). */
  return null;
};

/* Tour suivant : les vainqueurs du tour courant se rencontrent deux à deux,
   dans l'ordre des emplacements. Les couleurs alternent avec l'emplacement
   pour ne pas donner systématiquement les blancs au même côté de l'arbre. */
export function nextBracketRound(currentRoundMatches: Match[], round: number): BracketPairing[] {
  const ordered = [...currentRoundMatches].sort((a, b) => a.board_number - b.board_number);
  const winners = ordered.map(matchWinnerId);
  const pairings: BracketPairing[] = [];

  for (let i = 0; i < winners.length; i += 2) {
    const slot = i / 2 + 1;
    const [a, b] = [winners[i] ?? null, winners[i + 1] ?? null];
    pairings.push({
      round,
      slot,
      whiteId: slot % 2 === 1 ? a : b,
      blackId: slot % 2 === 1 ? b : a,
    });
  }
  return pairings;
}

export interface BracketSlot {
  round: number;
  slot: number;
  match: Match | null;
  white: Player | null;
  black: Player | null;
  winnerId: string | null;
}

/* Structure complète de l'arbre, tours vides compris : le schéma doit se
   dessiner en entier dès le premier tour, sinon on ne voit pas où l'on va. */
export function buildBracket(tournament: Tournament, matches: Match[], players: Player[]): BracketSlot[][] {
  const byId = new Map(players.map((p) => [p.id, p]));
  const playoff = matches.filter((m) => m.phase === 'playoff');
  const rounds = bracketRounds(tournament.qualifiers);

  return Array.from({ length: rounds }, (_, r) => {
    const round = r + 1;
    const slots = tournament.qualifiers / 2 ** round;

    return Array.from({ length: slots }, (_, s) => {
      const slot = s + 1;
      const match = playoff.find((m) => m.round === round && m.board_number === slot) ?? null;
      return {
        round,
        slot,
        match,
        white: match?.white_player_id ? byId.get(match.white_player_id) ?? null : null,
        black: match?.black_player_id ? byId.get(match.black_player_id) ?? null : null,
        winnerId: match ? matchWinnerId(match) : null,
      };
    });
  });
}

/* Arbre prévisionnel, avant que la phase finale ne soit lancée : on place
   les qualifiés provisoires d'après le classement actuel de la poule.
   Aucune partie n'existe encore — les cases se rempliront au fil des
   résultats validés dans les appariements. */
export function projectBracket(tournament: Tournament, players: Player[]): BracketSlot[][] {
  const rounds = bracketRounds(tournament.qualifiers);
  const standing = qualifyingStandings(players);
  const order = seedOrder(tournament.qualifiers);

  return Array.from({ length: rounds }, (_, r) => {
    const round = r + 1;
    const slots = tournament.qualifiers / 2 ** round;

    return Array.from({ length: slots }, (_, s) => {
      const slot = s + 1;
      /* Seul le premier tour est prévisible : au-delà, tout dépend des
         résultats. */
      const white = round === 1 ? standing[order[s * 2] - 1] ?? null : null;
      const black = round === 1 ? standing[order[s * 2 + 1] - 1] ?? null : null;
      return { round, slot, match: null, white, black, winnerId: null };
    });
  });
}

/* Le champion, une fois la finale tranchée. */
export function championId(bracket: BracketSlot[][]): string | null {
  const final = bracket[bracket.length - 1]?.[0];
  return final?.winnerId ?? null;
}
