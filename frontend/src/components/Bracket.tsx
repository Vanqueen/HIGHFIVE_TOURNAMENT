import { Crown, Loader2 } from 'lucide-react';
import {
  bracketRounds,
  buildBracket,
  championId,
  projectBracket,
  roundLabel,
  type BracketSlot,
} from '../lib/bracket';
import { INK, GOLD, RULE } from './Scoreboard';
import type { Match, Player, Tournament } from '../types';

/* ------------------------------------------------------------------ */
/*  L'arbre du tournoi.                                                */
/*                                                                     */
/*  Il est dessiné en entier dès le début : tant que la poule tourne,   */
/*  le premier tour affiche les qualifiés provisoires, et les tours     */
/*  suivants restent à déterminer. Chaque résultat validé dans les      */
/*  appariements fait avancer les noms d'une case vers la finale.       */
/*                                                                     */
/*  Géométrie : un match du tour r occupe 2^(r-1) lignes de grille,     */
/*  donc il se centre naturellement face aux deux matchs qui            */
/*  l'alimentent — aucun calcul de hauteur n'est nécessaire.            */
/* ------------------------------------------------------------------ */

export function Bracket({
  tournament,
  players,
  matches,
}: {
  tournament: Tournament;
  players: Player[];
  matches: Match[];
}) {
  if (tournament.format !== 'swiss_playoff') {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-14 text-center" style={{ borderColor: RULE }}>
        <p className="font-display text-lg font-bold uppercase">Pas de phase finale</p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500">
          Ce tournoi se joue en poule suisse seule : le classement désigne le vainqueur, sans arbre
          d’élimination. Le format se choisit à la création du tournoi.
        </p>
      </div>
    );
  }

  const live = tournament.phase === 'playoff';
  const bracket = live
    ? buildBracket(tournament, matches, players)
    : projectBracket(tournament, players);
  const rounds = bracketRounds(tournament.qualifiers);
  const champion = live ? players.find((p) => p.id === championId(bracket)) ?? null : null;

  return (
    <div>
      {!live && (
        <div
          className="mb-5 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: `${GOLD}55`, backgroundColor: `${GOLD}0D` }}
        >
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
            Arbre prévisionnel
          </span>
          <p className="mt-1 text-gray-600 dark:text-[#CBB9D8]">
            La poule qualificative n’est pas terminée. Le premier tour affiche les{' '}
            {tournament.qualifiers} joueurs qui seraient qualifiés au classement actuel — l’ordre peut
            encore changer à chaque résultat validé.
          </p>
        </div>
      )}

      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: `${rounds * 18}rem` }}>
          {/* En-têtes de tours */}
          <div
            className="mb-3 grid gap-x-8"
            style={{ gridTemplateColumns: `repeat(${rounds}, minmax(16rem, 1fr))` }}
          >
            {Array.from({ length: rounds }, (_, i) => {
              const round = i + 1;
              const current = live && tournament.playoff_round === round;
              return (
                <div key={round} className="flex items-center gap-2">
                  <h4
                    className="font-display text-sm font-bold uppercase tracking-[0.14em]"
                    style={{ color: current ? GOLD : '#9A9AA0' }}
                  >
                    {roundLabel(tournament.qualifiers, round)}
                  </h4>
                  {current && (
                    <span
                      className="font-display text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: GOLD }}
                    >
                      en cours
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className="grid gap-x-8"
            style={{
              gridTemplateColumns: `repeat(${rounds}, minmax(16rem, 1fr))`,
              /* Assez haut pour les deux boîtes séparées, leur écart et la
                 barre de saisie du résultat. */
              gridTemplateRows: `repeat(${tournament.qualifiers / 2}, minmax(7.5rem, auto))`,
            }}
          >
            {bracket.map((round, r) =>
              round.map((slot) => {
                const span = 2 ** r;
                const rowStart = (slot.slot - 1) * span + 1;
                const isLastRound = r === rounds - 1;

                return (
                  <div
                    key={`${slot.round}-${slot.slot}`}
                    className="flex items-stretch"
                    style={{ gridColumn: r + 1, gridRow: `${rowStart} / span ${span}` }}
                  >
                    {/* Arrivée du connecteur venant du tour précédent. */}
                    {r > 0 && <span className="my-auto h-px w-4 shrink-0" style={{ backgroundColor: 'var(--bracket-line)' }} />}

                    <div className="flex min-w-0 flex-1 items-center">
                      <SlotCard slot={slot} current={live && tournament.playoff_round === slot.round} />
                    </div>

                    {/* Départ vers le tour suivant : demi-boîte bordée, basse
                        pour l'emplacement impair, haute pour le pair. Les deux
                        se rejoignent exactement à la hauteur du match parent. */}
                    {!isLastRound && (
                      <span className="relative w-4 shrink-0">
                        <span
                          className={`absolute inset-x-0 border-r ${
                            slot.slot % 2 === 1 ? 'top-1/2 bottom-0 border-t' : 'top-0 bottom-1/2 border-b'
                          }`}
                          style={{ borderColor: 'var(--bracket-line)' }}
                        />
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {champion && (
        <div
          className="mt-6 flex items-center gap-4 rounded-2xl border p-5"
          style={{ borderColor: GOLD, backgroundColor: `${GOLD}0F` }}
        >
          <Crown className="h-8 w-8 shrink-0" style={{ color: GOLD }} strokeWidth={1.6} />
          <div>
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
              Vainqueur du tournoi
            </p>
            <p className="font-display text-2xl font-bold uppercase leading-tight dark:text-[#F8EFE7]">{champion.name}</p>
            {champion.club && <p className="text-xs text-gray-500 dark:text-[#CBB9D8]">{champion.club}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* Purement descriptif : l'arbre montre l'état du tournoi, il ne le pilote
   pas. Les résultats se saisissent dans l'onglet Appariements, qui reste
   le seul endroit où l'on agit sur une rencontre. */
function SlotCard({ slot, current }: { slot: BracketSlot; current: boolean }) {
  const decided = slot.winnerId !== null;
  const border = current && !decided ? GOLD : 'var(--bracket-line)';

  return (
    /* Deux boîtes distinctes, séparées : la disposition des feuilles
       d'arbre imprimées, plus lisible qu'un bloc coupé par un filet. */
    <div className="flex w-full flex-col gap-1.5">
      <Side
        player={slot.white}
        color="white"
        isWinner={decided && slot.winnerId === slot.white?.id}
        decided={decided}
        pending={Boolean(slot.match) && !decided}
        border={border}
      />
      <Side
        player={slot.black}
        color="black"
        isWinner={decided && slot.winnerId === slot.black?.id}
        decided={decided}
        pending={Boolean(slot.match) && !decided}
        border={border}
      />
    </div>
  );
}

/* Une ligne de l'appariement : le nom, puis la case de score à droite —
   la disposition des feuilles d'arbre imprimées. */
function Side({
  player,
  color,
  isWinner,
  decided,
  pending,
  border,
}: {
  player: Player | null;
  color: 'white' | 'black';
  isWinner: boolean;
  decided: boolean;
  pending: boolean;
  border: string;
}) {
  const eliminated = decided && !isWinner && player !== null;
  const score = decided ? (isWinner ? '1' : '0') : pending ? '·' : '';

  return (
    <div
      className="flex items-stretch overflow-hidden rounded-md border"
      style={{
        borderColor: isWinner ? 'var(--bracket-ink)' : border,
        backgroundColor: isWinner ? `${GOLD}14` : 'var(--bracket-card)',
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5">
        {/* Le carré dit la couleur des pièces, comme partout ailleurs. */}
        <span
          className="h-3 w-3 shrink-0 rounded-sm border"
          style={{
            backgroundColor: color === 'black' ? INK : '#fff',
            borderColor: color === 'black' ? INK : '#C9C9CE',
          }}
          title={color === 'black' ? 'Noirs' : 'Blancs'}
        />
        <span
          className={`min-w-0 flex-1 truncate text-sm ${isWinner ? 'font-bold' : 'font-medium'}`}
          style={{ color: eliminated ? 'var(--bracket-muted)' : 'var(--bracket-ink)' }}
        >
          {player?.name ?? <span className="text-gray-300">À déterminer</span>}
        </span>
        {player && (
          <span
            className="shrink-0 font-mono text-[11px] tabular"
            style={{ color: 'var(--bracket-muted)' }}
          >
            {player.rating || '—'}
          </span>
        )}
      </div>

      {/* Case de score, comme sur une feuille d'arbre. */}
      <div
        className="flex w-10 shrink-0 items-center justify-center border-l font-mono text-sm font-semibold tabular"
        style={{ borderColor: isWinner ? 'var(--bracket-ink)' : border, color: isWinner ? 'var(--bracket-ink)' : 'var(--bracket-muted)' }}
      >
        {score}
      </div>
    </div>
  );
}
