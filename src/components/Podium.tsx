import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { api } from '../lib/api';
import type { Player } from '../types';

const MEDALS = [
  { emoji: '🥇', rank: '1er',  glow: 'shadow-amber-500/20',  border: 'border-amber-500/30',  bg: 'bg-amber-500/5',  text: 'text-amber-300',  sub: 'text-amber-400/60' },
  { emoji: '🥈', rank: '2ème', glow: 'shadow-slate-400/10',  border: 'border-slate-500/20',  bg: 'bg-slate-800/40', text: 'text-slate-200',  sub: 'text-slate-400' },
  { emoji: '🥉', rank: '3ème', glow: 'shadow-orange-500/10', border: 'border-orange-500/20', bg: 'bg-orange-500/5', text: 'text-orange-300', sub: 'text-orange-400/60' },
];

export function Podium({ tournamentId }: { tournamentId: string }) {
  const [top, setTop] = useState<Player[]>([]);

  useEffect(() => {
    api.podium.get(tournamentId).then(setTop);
  }, [tournamentId]);

  if (top.length === 0) return null;

  return (
    <div className="mt-10 rounded-2xl border border-violet-500/15 bg-gradient-to-b from-violet-500/5 to-transparent p-6">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
          <Trophy className="h-4 w-4 text-violet-400" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100">Palmarès final</h3>
          <p className="text-xs text-slate-500">Tournoi terminé</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {top.map((p, i) => {
          const m = MEDALS[i];
          return (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-5 text-center shadow-xl transition-transform hover:-translate-y-0.5 ${m.bg} ${m.border} ${m.glow}`}
            >
              {i === 0 && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/5 to-transparent" />
              )}
              <div className="mb-3 text-5xl">{m.emoji}</div>
              <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${m.sub}`}>{m.rank}</p>
              <p className={`text-base font-bold ${m.text}`}>{p.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{p.club || `Elo ${p.rating}`}</p>
              <div className={`mt-3 inline-block rounded-full border px-3 py-1 font-mono text-sm font-semibold ${m.border} ${m.text}`}>
                {Number(p.points).toFixed(1)} pts
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
