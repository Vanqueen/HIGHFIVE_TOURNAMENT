import { useState } from 'react';
import type { Match, Player, Tournament } from '../types';

export function RoundsTab({ tournament, players, matches, onSetResult }: {
  tournament: Tournament;
  players: Player[];
  matches: Match[];
  onSetResult: (match: Match, result: Match['result']) => void;
}) {
  const rounds = Array.from({ length: tournament.current_round }, (_, i) => i + 1);
  const [activeRound, setActiveRound] = useState(tournament.current_round);

  if (rounds.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center text-sm text-slate-500">
        Aucune ronde générée. Lancez le tournoi pour commencer.
      </div>
    );
  }

  const roundMatches = matches.filter((m) => m.round === activeRound);
  const playerMap = new Map(players.map((p) => [p.id, p]));
  const pending = roundMatches.filter((m) => m.result === 'pending').length;

  return (
    <div>
      {/* Round selector */}
      <div className="mb-5 flex flex-wrap gap-2">
        {rounds.map((r) => (
          <button
            key={r}
            onClick={() => setActiveRound(r)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              activeRound === r
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                : 'border border-slate-700/50 bg-slate-800/40 text-slate-200 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            R{r}
          </button>
        ))}
        {pending > 0 && (
          <span className="ml-auto self-center text-xs text-slate-500">
            <span className="font-mono text-amber-400">{pending}</span> résultat{pending > 1 ? 's' : ''} en attente
          </span>
        )}
      </div>

      {/* Match cards */}
      <div className="space-y-2.5">
        {roundMatches.map((m) => {
          const white = m.white_player_id ? playerMap.get(m.white_player_id) ?? null : null;
          const black = m.black_player_id ? playerMap.get(m.black_player_id) ?? null : null;
          const isBye = !black;
          return (
            <div key={m.id} className="glass gradient-border rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 font-mono text-xs font-semibold text-slate-400">
                  {m.board_number}
                </span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <PlayerSlot player={white} color="white" result={m.result} />
                  <PlayerSlot player={black} color="black" result={m.result} isBye={isBye} />
                </div>
                <div className="shrink-0">
                  {isBye ? (
                    <span className="rounded-full border border-slate-700/50 bg-slate-800/40 px-3 py-1 text-xs text-slate-500">Exempt</span>
                  ) : (
                    <ResultSelector current={m.result} onChange={(r) => onSetResult(m, r)} disabled={tournament.status === 'completed'} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayerSlot({ player, color, result, isBye }: { player: Player | null; color: 'white' | 'black'; result: string; isBye?: boolean }) {
  const won = (color === 'white' && result === 'white') || (color === 'black' && result === 'black');
  const drew = result === 'draw';
  const lost = result !== 'pending' && !won && !drew && !isBye;

  return (
    <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors ${
      won ? 'bg-emerald-500/10 ring-1 ring-emerald-500/20' :
      drew ? 'bg-amber-500/10 ring-1 ring-amber-500/20' :
      lost ? 'bg-slate-800/30 opacity-60' :
      'bg-slate-800/40'
    }`}>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold ${
        color === 'white'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-slate-900 text-slate-100 border border-slate-700'
      }`}>
        {color === 'white' ? '♔' : '♚'}
      </span>
      <div className="min-w-0">
        <p className={`truncate text-sm font-medium ${won ? 'text-emerald-300' : drew ? 'text-amber-300' : 'text-slate-300'}`}>
          {player?.name ?? (isBye ? 'Exempt' : '—')}
        </p>
        {player && <p className="truncate text-xs text-slate-600">{player.club || `${player.rating}`}</p>}
      </div>
    </div>
  );
}

function ResultSelector({ current, onChange, disabled }: { current: string; onChange: (r: Match['result']) => void; disabled: boolean }) {
  const options: { value: Match['result']; label: string }[] = [
    { value: 'pending', label: '—' },
    { value: 'white', label: '1-0' },
    { value: 'draw',  label: '½' },
    { value: 'black', label: '0-1' },
  ];
  return (
    <div className="flex overflow-hidden rounded-xl border border-slate-700/50">
      {options.map((o) => (
        <button
          key={o.value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-2 text-xs font-mono font-medium transition-colors disabled:cursor-not-allowed ${
            current === o.value
              ? o.value === 'pending' ? 'bg-slate-700 text-slate-300'
              : 'bg-gradient-to-b from-violet-600 to-indigo-600 text-white'
              : 'bg-slate-900/60 text-slate-300 dark:text-slate-500 hover:bg-slate-800 hover:text-slate-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
