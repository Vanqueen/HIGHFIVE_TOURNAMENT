import { Trophy, Plus, MapPin, Calendar, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import { useTournaments } from '../hooks/useTournaments';
import type { Tournament } from '../types';
import { INK, GOLD, GOLD_DARK, GREEN, PURPLE } from '../components/landing/tokens';
import bgImage from '../assets/image10.jpg';

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

export function TournamentListPage({ onNew, onOpen, isAdmin }: {
  onNew: () => void;
  onOpen: (id: string) => void;
  isAdmin?: boolean;
}) {
  const { tournaments, loading } = useTournaments();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Tournament['status'] | 'all'>('all');

  const filtered = tournaments.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.location ?? '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: tournaments.length,
    registration: tournaments.filter((t) => t.status === 'registration').length,
    in_progress: tournaments.filter((t) => t.status === 'in_progress').length,
    completed: tournaments.filter((t) => t.status === 'completed').length,
  };

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
                Plateforme d'échecs
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl">
                Tous les <span style={{ color: GOLD }}>tournois</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {counts.in_progress > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: GOLD_DARK }} />
                    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: GOLD_DARK }} />
                  </span>
                  <span className="font-mono text-[0.65rem] font-semibold text-white">{counts.in_progress} en cours</span>
                </div>
              )}
              {isAdmin && (
                <button
                  onClick={onNew}
                  className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: GOLD_DARK }}
                >
                  <Plus className="h-4 w-4" /> Nouveau tournoi
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* barre recherche + filtres */}
      <div className="relative z-10 flex-none border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm px-8 py-3 lg:px-12">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un tournoi…"
              className="w-full rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-gray-800 py-2 pl-9 pr-4 text-sm outline-none focus:border-[#C6963B] dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="flex items-center gap-2">
            {([['all', 'Tous'], ['registration', 'Inscriptions'], ['in_progress', 'En cours'], ['completed', 'Terminés']] as const).map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: filter === val ? INK : 'transparent',
                  color: filter === val ? '#fff' : '#6B7280',
                  border: `1px solid ${filter === val ? INK : 'rgba(0,0,0,0.1)'}`,
                }}
              >
                {lbl} <span className="ml-1 opacity-60">{counts[val as keyof typeof counts] ?? counts.all}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* contenu */}
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-8 py-6 lg:px-12">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0,1,2,3,4,5].map((i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 dark:border-white/15 bg-white/60 dark:bg-gray-800/60 px-12 py-16 text-center">
            <Trophy className="mb-4 h-12 w-12" style={{ color: GOLD }} />
            <h3 className="mb-2 text-lg font-extrabold dark:text-white">Aucun tournoi trouvé</h3>
            <p className="text-sm text-gray-500">Modifiez votre recherche ou créez un nouveau tournoi.</p>
            {isAdmin && (
              <button onClick={onNew} className="mt-6 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: INK }}>
                <Plus className="h-4 w-4" /> Créer un tournoi
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((t) => {
              const badge = statusLabel(t.status);
              return (
                <button
                  key={t.id}
                  onClick={() => onOpen(t.id)}
                  className="group flex flex-col rounded-2xl border border-black/5 dark:border-white/10 bg-white/85 dark:bg-gray-800/85 backdrop-blur-sm p-5 text-left shadow-[0_8px_24px_-12px_rgba(17,17,20,0.15)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_rgba(17,17,20,0.22)]"
                >
                  {/* header carte */}
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

                  {/* nom */}
                  <h3 className="mb-3 text-base font-extrabold leading-snug tracking-tight dark:text-white" style={{ color: INK }}>
                    {t.name}
                  </h3>

                  {/* infos */}
                  <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {t.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />
                        {t.location}
                      </div>
                    )}
                    {t.start_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />
                        {formatDate(t.start_date)}
                      </div>
                    )}
                  </div>

                  {/* footer */}
                  <div className="flex items-center justify-between border-t border-black/5 dark:border-white/10 pt-3 text-xs text-gray-400 dark:text-gray-500 mt-4">
                    <span className="font-mono">{t.total_rounds} rondes</span>
                    {t.status === 'in_progress' && (
                      <span className="font-mono font-bold" style={{ color: GOLD_DARK }}>
                        Ronde {t.current_round}/{t.total_rounds}
                      </span>
                    )}
                    {t.status === 'completed' && (
                      <span className="font-mono text-gray-400">Terminé</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
