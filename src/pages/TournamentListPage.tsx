import { Trophy, Plus, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { useTournaments } from '../hooks/useTournaments';
import type { Tournament } from '../types';
import { INK, GOLD, GOLD_DARK, GREEN, PURPLE } from '../components/landing/tokens';

function formatDate(value: string) {
  return new Date(value)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function statusLabel(status: Tournament['status']) {
  switch (status) {
    case 'registration': return { label: 'INSCRIPTIONS OUVERTES', color: GREEN };
    case 'in_progress':  return { label: 'EN COURS', color: GOLD_DARK };
    case 'completed':    return { label: 'TERMINÉ', color: '#6B7280' };
    default:             return { label: 'À VENIR', color: PURPLE };
  }
}

export function TournamentListPage({ onNew, onOpen, isAdmin }: {
  onNew: () => void;
  onOpen: (id: string) => void;
  isAdmin?: boolean;
}) {
  const { tournaments, loading } = useTournaments();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10" style={{ color: INK }}>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">TOURNOIS</h1>
          <p className="mt-2 text-sm text-gray-500">
            Tous les tournois disponibles sur la plateforme.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={onNew}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: INK }}
          >
            <Plus className="h-4 w-4" />
            Nouveau tournoi
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-44 rounded-2xl" />
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-8 py-20 text-center">
          <Trophy className="mb-4 h-10 w-10" style={{ color: GOLD }} />
          <h3 className="mb-1 text-base font-extrabold">Aucun tournoi pour l'instant</h3>
          <p className="mb-6 text-sm text-gray-500">Les tournois apparaîtront ici dès leur création.</p>
          {isAdmin && (
            <button
              onClick={onNew}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white"
              style={{ backgroundColor: INK }}
            >
              <Plus className="h-4 w-4" /> Créer un tournoi
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => {
            const badge = statusLabel(t.status);
            return (
              <button
                key={t.id}
                onClick={() => onOpen(t.id)}
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

                <h3 className="text-base font-extrabold leading-snug">{t.name}</h3>

                <div className="space-y-1 text-xs text-gray-500">
                  {t.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0" style={{ color: GOLD }} />
                      {t.location}
                    </div>
                  )}
                  {t.start_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 shrink-0" style={{ color: GOLD }} />
                      {formatDate(t.start_date)}
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-400">
                  <span className="font-mono">{t.total_rounds} rondes</span>
                  {t.status === 'in_progress' && (
                    <span className="font-mono font-bold" style={{ color: GOLD }}>
                      R{t.current_round}/{t.total_rounds}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
