import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { shortRoundLabel } from '../lib/bracket';
import { INK, GOLD, RULE, squareTint } from './Scoreboard';
import type { Match, Phase, Player, Tournament } from '../types';

interface Section {
  key: string;
  phase: Phase;
  round: number;
  label: string;
}

/* Toutes les rencontres du tournoi, poule et phase finale confondues :
   c'est ici, et nulle part ailleurs, que les résultats se saisissent. */
export function RoundsTab({
  tournament,
  players,
  matches,
  canEdit,
  busy,
  onSetResult,
}: {
  tournament: Tournament;
  players: Player[];
  matches: Match[];
  canEdit: boolean;
  busy: boolean;
  onSetResult: (match: Match, result: Match['result']) => void;
}) {
  const sections = useMemo<Section[]>(() => {
    const pool: Section[] = Array.from({ length: tournament.current_round }, (_, i) => ({
      key: `q${i + 1}`,
      phase: 'qualifying' as const,
      round: i + 1,
      label: `R${i + 1}`,
    }));

    const playoff: Section[] =
      tournament.phase === 'playoff'
        ? Array.from({ length: tournament.playoff_round }, (_, i) => ({
            key: `p${i + 1}`,
            phase: 'playoff' as const,
            round: i + 1,
            label: shortRoundLabel(tournament.qualifiers, i + 1),
          }))
        : [];

    return [...pool, ...playoff];
  }, [tournament.current_round, tournament.phase, tournament.playoff_round, tournament.qualifiers]);

  const [activeKey, setActiveKey] = useState(sections[sections.length - 1]?.key ?? '');

  /* Une nouvelle ronde ou un nouveau tour vient d'être généré : on s'y place. */
  useEffect(() => {
    const last = sections[sections.length - 1];
    if (last) setActiveKey(last.key);
  }, [sections]);

  if (sections.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-12 text-center" style={{ borderColor: RULE }}>
        <p className="font-display text-lg font-bold uppercase">Aucune ronde générée</p>
        <p className="mt-1.5 text-sm text-gray-500">
          Lancez la poule qualificative pour produire les premiers appariements.
        </p>
      </div>
    );
  }

  const active = sections.find((s) => s.key === activeKey) ?? sections[sections.length - 1];
  const isPlayoff = active.phase === 'playoff';

  const roundMatches = matches
    .filter((m) => (m.phase === 'playoff') === isPlayoff && m.round === active.round)
    .sort((a, b) => a.board_number - b.board_number);
  const byId = new Map(players.map((p) => [p.id, p]));

  /* En phase finale, une nulle ne départage pas : la rencontre reste
     ouverte tant qu'aucun vainqueur n'est saisi. */
  const unresolved = roundMatches.filter((m) =>
    isPlayoff ? m.result !== 'white' && m.result !== 'black' : m.result === 'pending'
  ).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {sections.map((section, i) => {
          const isActive = section.key === active.key;
          const startsPlayoff = section.phase === 'playoff' && sections[i - 1]?.phase === 'qualifying';
          const accent = section.phase === 'playoff' ? GOLD : INK;

          return (
            <span key={section.key} className="flex items-center gap-2">
              {/* Séparateur visuel entre la poule et la phase finale. */}
              {startsPlayoff && <span className="h-5 w-px" style={{ backgroundColor: RULE }} />}
              <button
                onClick={() => setActiveKey(section.key)}
                className="focus-ring rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold tabular transition-colors"
                style={{
                  backgroundColor: isActive ? accent : 'var(--surface-card-strong)',
                  borderColor: isActive ? accent : RULE,
                  color: isActive ? '#fff' : '#8A8A90',
                }}
              >
                {section.label}
              </button>
            </span>
          );
        })}

        {unresolved > 0 && (
          <span
            className="ml-auto font-display text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: GOLD }}
          >
            {unresolved} résultat{unresolved > 1 ? 's' : ''} en attente
          </span>
        )}
      </div>

      {isPlayoff && (
        <p className="mb-3 text-xs text-gray-500">
          Phase finale : chaque rencontre doit désigner un vainqueur. Une partie nulle se départage au
          blitz — saisissez le vainqueur du départage.
        </p>
      )}

      <ul className="overflow-hidden rounded-2xl border" style={{ borderColor: RULE }}>
        {roundMatches.map((match, i) => {
          const white = match.white_player_id ? byId.get(match.white_player_id) ?? null : null;
          const black = match.black_player_id ? byId.get(match.black_player_id) ?? null : null;
          const isBye = !black;

          return (
            <li
              key={match.id}
              className={`${i === 0 ? '' : 'border-t'} ${squareTint(i)}`}
              style={{ borderColor: RULE }}
            >
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                {/* Numéro d'échiquier en poule, emplacement dans l'arbre en
                    phase finale — la coordonnée de la rencontre. */}
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold tabular"
                  style={{ borderColor: RULE, backgroundColor: 'var(--surface-card-strong)' }}
                  title={isPlayoff ? 'Emplacement dans l’arbre' : 'Échiquier'}
                >
                  {match.board_number}
                </span>

                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                  <Side player={white} color="white" result={match.result} />
                  <Side player={black} color="black" result={match.result} isBye={isBye} />
                </div>

                <div className="shrink-0">
                  {isBye ? (
                    <span className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                      Exempt · 1 point
                    </span>
                  ) : (
                    <ResultPicker
                      current={match.result}
                      allowDraw={!isPlayoff}
                      disabled={!canEdit || busy}
                      onChange={(r) => onSetResult(match, r)}
                    />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Side({
  player,
  color,
  result,
  isBye,
}: {
  player: Player | null;
  color: 'white' | 'black';
  result: Match['result'];
  isBye?: boolean;
}) {
  const won = result === color;
  const drew = result === 'draw';
  const lost = result !== 'pending' && !won && !drew && !isBye;

  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border px-3 py-2"
      style={{
        borderColor: won ? 'var(--text-primary)' : RULE,
        backgroundColor: won ? `${GOLD}12` : 'var(--surface-card-strong)',
      }}
    >
      <span
        className="h-3.5 w-3.5 shrink-0 rounded-sm border"
        style={{
          backgroundColor: color === 'black' ? INK : '#fff',
          borderColor: color === 'black' ? INK : '#C9C9CE',
        }}
        title={color === 'black' ? 'Noirs' : 'Blancs'}
      />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm ${won ? 'font-bold' : 'font-medium'}`}
          style={{ color: lost ? '#B0B0B6' : 'var(--text-primary)' }}
        >
          {player?.name ?? (isBye ? 'Exempt' : '—')}
        </p>
        {player && (
          <p className="truncate text-[11px] text-gray-400">
            {player.club || 'Sans club'} · <span className="font-mono tabular">{player.rating || '—'}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function ResultPicker({
  current,
  allowDraw,
  disabled,
  onChange,
}: {
  current: Match['result'];
  allowDraw: boolean;
  disabled: boolean;
  onChange: (result: Match['result']) => void;
}) {
  const options: { value: Match['result']; label: string }[] = [
    { value: 'white', label: '1-0' },
    ...(allowDraw ? [{ value: 'draw' as const, label: '½-½' }] : []),
    { value: 'black', label: '0-1' },
    { value: 'pending', label: '—' },
  ];

  return (
    <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: RULE }}>
      {options.map((option, i) => (
        <button
          key={option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`focus-ring px-2.5 py-2 font-mono text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            i > 0 ? 'border-l' : ''
          }`}
          style={{
            borderColor: RULE,
            backgroundColor: current === option.value ? 'var(--text-primary)' : 'var(--surface-card-strong)',
            color: current === option.value ? 'var(--app-bg)' : '#8A8A90',
          }}
        >
          {disabled && current === option.value ? (
            <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
          ) : (
            option.label
          )}
        </button>
      ))}
    </div>
  );
}
