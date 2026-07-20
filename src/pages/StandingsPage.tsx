import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { api } from '../lib/api';
import { BackButton, PageWrapper } from '../components/ui';
import type { Player } from '../types';

export function StandingsPage({ tournamentId, onBack }: { tournamentId: string; onBack: () => void }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.players.list(tournamentId).then((data) => {
      setPlayers(data ?? []);
      setLoading(false);
    });
  }, [tournamentId]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="h-8 w-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
    </div>
  );

  const sorted = [...players].sort((a, b) => Number(b.points) - Number(a.points) || b.rating - a.rating);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <PageWrapper>
      <BackButton onClick={onBack} />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
          <BarChart3 className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Classement</h2>
          <p className="text-sm text-slate-500">Système suisse — points cumulés</p>
        </div>
      </div>

      <div className="glass gradient-border overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/60">
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Rang</th>
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Joueur</th>
              <th className="hidden px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:table-cell">Club</th>
              <th className="hidden px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500 md:table-cell">Elo</th>
              <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {sorted.map((p, i) => (
              <tr key={p.id} className={`transition-colors hover:bg-slate-800/30 ${i === 0 ? 'bg-amber-500/5' : ''}`}>
                <td className="px-5 py-4 font-semibold">
                  {i < 3
                    ? <span className="text-xl">{medals[i]}</span>
                    : <span className="font-mono text-slate-500">{i + 1}</span>
                  }
                </td>
                <td className="px-5 py-4">
                  <span className={`font-medium ${i === 0 ? 'text-amber-300' : 'text-slate-200'}`}>{p.name}</span>
                </td>
                <td className="hidden px-5 py-4 text-slate-500 sm:table-cell">{p.club || '—'}</td>
                <td className="hidden px-5 py-4 font-mono text-slate-400 md:table-cell">{p.rating}</td>
                <td className="px-5 py-4 text-right">
                  <span className={`font-mono font-semibold ${i === 0 ? 'text-amber-300' : i < 3 ? 'text-slate-200' : 'text-slate-400'}`}>
                    {Number(p.points).toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
