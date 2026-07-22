import { useState, useEffect } from 'react';
import { Trophy, MapPin, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import { useTournaments } from '../hooks/useTournaments';
import { api } from '../lib/api';
import type { Tournament, Player } from '../types';
import { INK, GOLD, GOLD_DARK, GREEN, PURPLE } from '../components/landing/tokens';

function formatDate(value: string) {
  return new Date(value)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    .toUpperCase();
}

function statusLabel(status: Tournament['status']) {
  switch (status) {
    case 'registration': return { label: 'INSCRIPTIONS OUVERTES', color: GREEN };
    case 'in_progress':  return { label: 'EN COURS', color: GOLD_DARK };
    case 'completed':    return { label: 'TERMINÉ', color: '#6B7280' };
    default:             return { label: 'À VENIR', color: PURPLE };
  }
}

function StandingsPanel({ tournament, onBack }: { tournament: Tournament; onBack: () => void }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.players.list(tournament.id).then((data) => {
      setPlayers([...(data ?? [])].sort((a, b) => Number(b.points) - Number(a.points) || b.rating - a.rating));
      setLoading(false);
    });
  }, [tournament.id]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux tournois
      </button>

      <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Trophy className="h-7 w-7 shrink-0" style={{ color: GOLD }} />
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: INK }}>{tournament.name}</h2>
            <p className="text-sm text-gray-500">Classement — système suisse</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
          </div>
        ) : players.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">Aucun joueur inscrit</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Rang</th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Joueur</th>
                <th className="hidden pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">Club</th>
                <th className="hidden pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 md:table-cell">Elo</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {players.map((p, i) => (
                <tr key={p.id} className={`transition-colors hover:bg-gray-50 ${i === 0 ? 'bg-amber-50/60' : ''}`}>
                  <td className="py-3 pr-4 font-semibold">
                    {i < 3
                      ? <span className="text-base">{medals[i]}</span>
                      : <span className="font-mono text-gray-400">{i + 1}</span>
                    }
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`font-semibold ${i === 0 ? 'text-amber-600' : ''}`} style={{ color: i > 0 ? INK : undefined }}>{p.name}</span>
                  </td>
                  <td className="hidden py-3 pr-4 text-gray-500 sm:table-cell">{p.club || '—'}</td>
                  <td className="hidden py-3 pr-4 font-mono text-gray-500 md:table-cell">{p.rating}</td>
                  <td className="py-3 text-right">
                    <span className={`font-mono font-bold ${i === 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {Number(p.points).toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function ClassementsPage({ onTournamentClick }: { onTournamentClick?: (id: string) => void }) {
  const { tournaments, loading } = useTournaments();
  const [selected, setSelected] = useState<Tournament | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10" style={{ color: INK }}>
      {selected ? (
        <StandingsPanel tournament={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">CLASSEMENTS</h1>
            <p className="mt-2 text-sm text-gray-500">Sélectionnez un tournoi pour consulter son classement.</p>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-40 rounded-2xl" />
              ))}
            </div>
          ) : tournaments.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">
              Aucun tournoi disponible
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tournaments.map((t) => {
                const badge = statusLabel(t.status);
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className="group flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className="inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white"
                        style={{ backgroundColor: badge.color }}
                      >
                        {badge.label}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: GOLD }} />
                    </div>
                    <h3 className="text-base font-extrabold leading-tight">{t.name}</h3>
                    <div className="space-y-1 text-xs text-gray-500">
                      {t.start_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 shrink-0" style={{ color: GOLD }} />
                          {formatDate(t.start_date)}
                        </div>
                      )}
                      {t.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 shrink-0" style={{ color: GOLD }} />
                          {t.location}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
