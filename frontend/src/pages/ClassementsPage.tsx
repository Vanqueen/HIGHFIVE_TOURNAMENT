import { useState, useEffect } from 'react';
import { Trophy, MapPin, Calendar, ChevronRight, ArrowLeft, Medal } from 'lucide-react';
import { useTournaments } from '../hooks/useTournaments';
import { api } from '../lib/api';
import type { Tournament, Player } from '../types';
import { INK, GOLD, GOLD_DARK, GREEN, PURPLE } from '../components/landing/tokens';
import bgImage from '../assets/image11.jpg';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function statusLabel(status: Tournament['status']) {
  switch (status) {
    case 'registration': return { label: 'Inscriptions ouvertes', color: GREEN };
    case 'in_progress':  return { label: 'En cours', color: GOLD_DARK };
    case 'completed':    return { label: 'Terminé', color: '#6B7280' };
    default:             return { label: 'À venir', color: PURPLE };
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

  const badge = statusLabel(tournament.status);
  const maxPts = players[0] ? Number(players[0].points) : 1;

  // Podium : ordre visuel 2-1-3
  const podiumOrder = [players[1], players[0], players[2]].filter(Boolean);
  const podiumMeta = [
    { rank: 2, emoji: '🥈', height: 'h-20', color: '#9CA3AF', border: 'border-gray-300/40', bg: 'bg-gray-100/60 dark:bg-gray-700/60' },
    { rank: 1, emoji: '🥇', height: 'h-28', color: GOLD,      border: 'border-amber-400/50', bg: 'bg-amber-50/70 dark:bg-amber-900/30' },
    { rank: 3, emoji: '🥉', height: 'h-14', color: '#CD7F32', border: 'border-orange-400/30', bg: 'bg-orange-50/60 dark:bg-orange-900/20' },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

      {/* barre retour + infos tournoi */}
      <div className="flex-none border-b border-black/5 dark:border-white/10 bg-white/75 dark:bg-gray-900/75 backdrop-blur-sm px-8 py-4 lg:px-12">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-800 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux classements
        </button>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${GOLD}22` }}>
            <Trophy className="h-5 w-5" style={{ color: GOLD }} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold leading-tight tracking-tight text-gray-700 dark:text-white">{tournament.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-block rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: badge.color }}>{badge.label}</span>
              {tournament.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" style={{ color: GOLD }} />{tournament.location}</span>}
              {tournament.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" style={{ color: GOLD }} />{formatDate(tournament.start_date)}</span>}
              <span className="font-mono">{tournament.total_rounds} rondes</span>
              {!loading && <span className="font-mono">{players.length} joueur{players.length > 1 ? 's' : ''}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* corps */}
      <div className="min-h-0 flex-1 overflow-hidden px-8 py-6 lg:px-12">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800 dark:border-gray-700 dark:border-t-gray-200" />
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 dark:border-white/15 bg-white/60 dark:bg-gray-800/60 py-16 text-center">
            <Medal className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-400">Aucun joueur inscrit à ce tournoi.</p>
          </div>
        ) : (
          <div className="grid h-full gap-4 lg:grid-cols-[1fr_1.4fr]">

            {/* ---- PODIUM VISUEL ---- */}
            <div className="overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-[0_16px_48px_-24px_rgba(17,17,20,0.18)] flex flex-col">
              <div className="flex-none border-b border-black/5 dark:border-white/10 px-5 py-3">
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-gray-400">Podium</p>
              </div>
              <div className="flex flex-1 items-end justify-center gap-3 px-6 pb-0 pt-6" style={{ background: `linear-gradient(135deg, ${GOLD}10 0%, transparent 60%)` }}>
                {players.length >= 2 ? podiumOrder.map((p, vi) => {
                  const meta = podiumMeta[vi];
                  const isFirst = meta.rank === 1;
                  return (
                    <div key={p.id} className="flex flex-1 max-w-[160px] flex-col items-center">
                      <div className={`w-full rounded-2xl border ${meta.border} ${meta.bg} px-2 py-3 text-center mb-2`}>
                        <span className="text-2xl">{meta.emoji}</span>
                        <p className={`mt-1.5 font-bold leading-tight dark:text-white truncate ${isFirst ? 'text-sm' : 'text-xs'}`} style={{ color: INK }}>{p.name}</p>
                        {p.club && <p className="mt-0.5 truncate text-[0.6rem] text-gray-400">{p.club}</p>}
                        <p className="mt-1.5 font-mono font-bold" style={{ fontSize: isFirst ? '1.1rem' : '0.9rem', color: meta.color }}>
                          {Number(p.points).toFixed(1)}<span className="ml-0.5 text-[0.6rem] font-normal text-gray-400">pts</span>
                        </p>
                        <p className="font-mono text-[0.6rem] text-gray-400">Elo {p.rating}</p>
                      </div>
                      <div
                        className={`w-full rounded-t-xl ${meta.height} flex items-center justify-center font-mono text-lg font-black text-white/80`}
                        style={{ backgroundColor: meta.color }}
                      >
                        {meta.rank}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center pb-8 text-gray-400">
                    <Medal className="mb-2 h-8 w-8" />
                    <p className="text-xs">Pas assez de joueurs</p>
                  </div>
                )}
              </div>
            </div>

            {/* ---- TABLEAU COMPLET ---- */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white/85 dark:bg-gray-800/85 backdrop-blur-sm shadow-[0_8px_24px_-12px_rgba(17,17,20,0.12)]">
              <div className="flex-none border-b border-black/5 dark:border-white/10 px-5 py-3">
                <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">Classement complet · {players.length} joueurs</h3>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95">
                    <tr className="border-b border-black/5 dark:border-white/10">
                      <th className="px-4 py-2.5 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400 w-10">#</th>
                      <th className="px-4 py-2.5 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400">Joueur</th>
                      <th className="hidden px-4 py-2.5 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">Club</th>
                      <th className="hidden px-4 py-2.5 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400 md:table-cell">Elo</th>
                      <th className="px-4 py-2.5 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400">Pts</th>
                      <th className="hidden px-4 py-2.5 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400 lg:table-cell">Progression</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                    {players.map((p, i) => {
                      const pts = Number(p.points);
                      const pct = maxPts > 0 ? (pts / maxPts) * 100 : 0;
                      const isTop3 = i < 3;
                      const rankColors = ['text-amber-500', 'text-gray-400', 'text-orange-500'];
                      return (
                        <tr key={p.id} className={`transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03] ${i === 0 ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''}`}>
                          <td className="px-4 py-2.5">
                            {isTop3
                              ? <span className={`text-base ${rankColors[i]}`}>{['🥇','🥈','🥉'][i]}</span>
                              : <span className="font-mono text-sm text-gray-400">{i + 1}</span>}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`text-sm font-semibold dark:text-gray-100 ${i === 0 ? 'text-amber-600 dark:text-amber-400' : ''}`} style={{ color: i > 0 ? INK : undefined }}>{p.name}</span>
                          </td>
                          <td className="hidden px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 sm:table-cell">{p.club || '—'}</td>
                          <td className="hidden px-4 py-2.5 font-mono text-sm text-gray-500 dark:text-gray-400 md:table-cell">{p.rating}</td>
                          <td className="px-4 py-2.5">
                            <span className={`font-mono text-sm font-bold ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-300'}`}>
                              {pts.toFixed(1)}
                            </span>
                          </td>
                          <td className="hidden px-4 py-2.5 lg:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: i === 0 ? GOLD : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7F32' : `${GOLD}80` }} />
                              </div>
                              <span className="font-mono text-[0.65rem] text-gray-400">{Math.round(pct)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export function ClassementsPage({ onTournamentClick }: { onTournamentClick?: (id: string) => void }) {
  const { tournaments, loading } = useTournaments();
  const [selected, setSelected] = useState<Tournament | null>(null);

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{ fontSize: '16px', height: '100%', backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* overlay */}
      <div className="pointer-events-none absolute inset-0 bg-white/60 dark:bg-black/65" style={{ backdropFilter: 'blur(5px)' }} />

      {/* bandeau */}
      <section className="relative z-10 flex-none" style={{ backgroundColor: INK }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(45deg,#fff 25%,transparent 25%,transparent 75%,#fff 75%),linear-gradient(45deg,#fff 25%,transparent 25%,transparent 75%,#fff 75%)`,
            backgroundSize: '64px 64px', backgroundPosition: '0 0,32px 32px',
          }}
        />
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 100% at 80% 0%,${GOLD}2b 0%,transparent 62%)` }} />
        <div className="relative px-8 py-5 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.34em]" style={{ color: GOLD }}>
                Système suisse
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl">
                {selected ? <><span style={{ color: GOLD }}>Classement</span> — {selected.name}</> : <>Tous les <span style={{ color: GOLD }}>classements</span></>}
              </h1>
            </div>
            {!selected && tournaments.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm">
                  <span className="font-mono text-[0.65rem] font-semibold text-white">{tournaments.length} tournoi{tournaments.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* contenu */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        {selected ? (
          <StandingsPanel tournament={selected} onBack={() => setSelected(null)} />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6 lg:px-12">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[0,1,2,3,4,5].map((i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
              </div>
            ) : tournaments.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-black/10 dark:border-white/15 bg-white/60 dark:bg-gray-800/60 text-sm text-gray-400">
                Aucun tournoi disponible
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tournaments.map((t) => {
                  const badge = statusLabel(t.status);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelected(t)}
                      className="group flex flex-col rounded-2xl border border-black/5 dark:border-white/10 bg-white/85 dark:bg-gray-800/85 backdrop-blur-sm p-5 text-left shadow-[0_8px_24px_-12px_rgba(17,17,20,0.15)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_rgba(17,17,20,0.22)]"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-white"
                          style={{ backgroundColor: badge.color }}
                        >
                          {t.status === 'in_progress' && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                            </span>
                          )}
                          {badge.label}
                        </span>
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" style={{ color: GOLD }} />
                      </div>

                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${GOLD}18` }}>
                          <Trophy className="h-4 w-4" style={{ color: GOLD }} />
                        </div>
                        <h3 className="text-sm font-extrabold leading-snug tracking-tight text-gray-700 dark:text-white">{t.name}</h3>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                        {t.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />{t.location}
                          </div>
                        )}
                        {t.start_date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />{formatDate(t.start_date)}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-black/5 dark:border-white/10 pt-3 text-xs text-gray-400 dark:text-gray-500">
                        <span className="font-mono">{t.total_rounds} rondes</span>
                        {t.status === 'in_progress' && (
                          <span className="font-mono font-bold" style={{ color: GOLD_DARK }}>Ronde {t.current_round}/{t.total_rounds}</span>
                        )}
                        {t.status === 'completed' && (
                          <span className="flex items-center gap-1 font-mono text-gray-400">🏆 Terminé</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
