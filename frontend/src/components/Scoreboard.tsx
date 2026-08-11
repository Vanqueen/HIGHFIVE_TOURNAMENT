import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/*  Primitives empruntées à la feuille de résultats affichée en salle.  */
/*                                                                     */
/*  Un seul dispositif, la cellule, décliné deux fois :                */
/*   - ScoreStrip : la ligne du joueur dans la grille américaine       */
/*   - RoundRuler : l'avancement d'un tournoi, ronde par ronde         */
/*                                                                     */
/*  Convention de lecture, celle des échecs :                          */
/*   remplissage = couleur jouée (clair = Blancs, encre = Noirs)       */
/*   glyphe      = résultat (1 gagné · ½ nulle · 0 perdu)              */
/* ------------------------------------------------------------------ */

export const INK = '#111114';
export const GOLD = '#C6963B';
export const PURPLE = '#5B3E96';
export const GREEN = '#3E9B4F';
export const RULE = 'rgba(17,17,20,0.09)';

// Dark
export const DARK_INK = '#F5F4F8';           // Texte principal
export const DARK_GOLD = '#E4B85C';          // Or plus lumineux
export const DARK_PURPLE = '#9B7CFF';        // Violet plus éclatant
export const DARK_GREEN = '#56C271';         // Vert plus lumineux
export const DARK_RULE = 'rgba(245,244,248,0.12)'; // Séparateurs

export type PieceColor = 'white' | 'black';
export type Outcome = 'win' | 'draw' | 'loss';

export interface PlayedGame {
  round: number;
  color: PieceColor;
  outcome: Outcome;
}

const GLYPH: Record<Outcome, string> = { win: '1', draw: '½', loss: '0' };
const OUTCOME_LABEL: Record<Outcome, string> = { win: 'gagnée', draw: 'nulle', loss: 'perdue' };

/* La ligne de forme : une cellule par ronde jouée. */
export function ScoreStrip({ games, animate = true }: { games: PlayedGame[]; animate?: boolean }) {
  if (games.length === 0) {
    return <p className="font-mono text-xs text-gray-400">Aucune ronde jouée</p>;
  }

  return (
    <ol className="flex flex-wrap gap-1" aria-label="Résultats par ronde">
      {games.map((game, i) => {
        const isBlack = game.color === 'black';
        return (
          <li
            key={game.round}
            title={`Ronde ${game.round} · ${isBlack ? 'Noirs' : 'Blancs'} · ${OUTCOME_LABEL[game.outcome]}`}
            className={`flex h-8 w-7 items-center justify-center rounded-md border font-mono text-[13px] font-semibold tabular ${
              animate ? 'cell-in' : ''
            }`}
            style={{
              animationDelay: animate ? `${i * 55}ms` : undefined,
              backgroundColor: isBlack ? INK : '#fff',
              borderColor: isBlack ? INK : RULE,
              /* Sur fond clair comme sur fond encre, la nulle reste dorée :
                 c'est le seul résultat qui ne se lit pas au contraste. */
              color:
                game.outcome === 'draw'
                  ? GOLD
                  : game.outcome === 'loss'
                    ? isBlack
                      ? 'rgba(255,255,255,0.35)'
                      : '#C4C4C8'
                    : isBlack
                      ? '#fff'
                      : INK,
            }}
          >
            <span aria-label={`Ronde ${game.round}, ${isBlack ? 'noirs' : 'blancs'}, ${OUTCOME_LABEL[game.outcome]}`}>
              {GLYPH[game.outcome]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* L'avancement d'un tournoi : une cellule numérotée par ronde. */
export function RoundRuler({ total, current }: { total: number; current: number }) {
  return (
    <ol
      className="flex flex-wrap gap-1"
      aria-label={`Ronde ${current} sur ${total}`}
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((round) => {
        const played = round < current;
        const live = round === current;
        return (
          <li
            key={round}
            title={played ? `Ronde ${round} terminée` : live ? `Ronde ${round} en cours` : `Ronde ${round} à venir`}
            className="flex h-6 w-6 items-center justify-center rounded font-mono text-[11px] font-semibold tabular"
            style={{
              backgroundColor: played ? INK : live ? GOLD : 'transparent',
              border: played || live ? '1px solid transparent' : `1px solid ${RULE}`,
              color: played || live ? '#fff' : '#A9A9AE',
            }}
          >
            {round}
          </li>
        );
      })}
    </ol>
  );
}

/* Bandeau d'identité : remplace la rangée de tuiles statistiques.
   Les chiffres sont en mono, alignés, séparés par des filets. */
export function DataBar({
  role,
  name,
  detail,
  metrics,
  accent = INK,
}: {
  role: string;
  name: string;
  detail?: string | null;
  metrics: { value: ReactNode; label: string }[];
  accent?: string;
}) {
  return (
    <div className="mb-8 overflow-hidden rounded-2xl border bg-white dark:bg-gray-700" style={{ borderColor: RULE }}>
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <p
            className="font-display text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {role}
          </p>
          <h1 className="mt-1 truncate font-display text-3xl font-bold uppercase leading-none tracking-[0.005em] sm:text-4xl">
            {name}
          </h1>
          {detail && <p className="mt-1.5 truncate text-sm text-gray-500">{detail}</p>}
        </div>

        <dl className="flex shrink-0 items-end">
          {metrics.map((metric, i) => (
            <div
              key={metric.label}
              className={i > 0 ? 'ml-5 border-l pl-5' : ''}
              style={i > 0 ? { borderColor: RULE } : undefined}
            >
              <dd className="font-mono text-2xl font-semibold leading-none tabular">{metric.value}</dd>
              <dt className="mt-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                {metric.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
      <CheckerEdge accent={accent} />
    </div>
  );
}

/* Titre de section : filet + libellé condensé + compteur mono. */
export function SectionHead({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <h2 className="font-display text-xl font-bold uppercase tracking-[0.02em] text-slate-900 dark:text-slate-400">{title}</h2>
      {count !== undefined && (
        <span className="font-mono text-xs font-semibold text-gray-400 tabular">{String(count).padStart(2, '0')}</span>
      )}
      <span className="h-px flex-1 bg-black/[0.09] dark:bg-white/[0.12]" />
      {action}
    </div>
  );
}

/* Chaque état emprunte la pièce qui lui correspond dans une partie :
   le pion ouvre le jeu, le cavalier est la pièce du milieu de partie,
   le roi met un terme à la rencontre. */
export function StatusTag({ status }: { status: 'registration' | 'in_progress' | 'completed' }) {
  const config = {
    registration: { label: 'Inscriptions ouvertes', color: GREEN, piece: '♟' },
    in_progress: { label: 'En cours', color: GOLD, piece: '♞' },
    completed: { label: 'Terminé', color: '#8A8A90', piece: '♚' },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em]"
      style={{ color: config.color }}
    >
      <span aria-hidden="true" className="text-[13px] leading-none">
        {config.piece}
      </span>
      {config.label}
    </span>
  );
}

/* Le bord d'un échiquier : cases alternées. Remplace le filet plat en
   pied du bandeau d'identité. */
export function CheckerEdge({ accent = INK, squares = 32 }: { accent?: string; squares?: number }) {
  return (
    <div className="flex h-1.5 w-full" aria-hidden="true">
      {Array.from({ length: squares }, (_, i) => (
        <span
          key={i}
          className={`h-full flex-1 ${i % 2 !== 0 ? 'bg-[#111114] dark:bg-white/20' : ''}`}
          style={i % 2 === 0 ? { backgroundColor: accent } : undefined}
        />
      ))}
    </div>
  );
}

/* Les lignes d'un tableau alternent comme les cases d'une colonne
   d'échiquier. Zébrure fonctionnelle autant que thématique. */
export const squareTint = (index: number) =>
  index % 2 === 1 ? 'bg-[#F6F4F0] dark:bg-white/[0.03]' : 'bg-white dark:bg-transparent';
