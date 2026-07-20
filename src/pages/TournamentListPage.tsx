import { Trophy, Plus, MapPin, Calendar, ArrowRight, Users } from 'lucide-react';
import { useTournaments } from '../hooks/useTournaments';
import { Badge, PageWrapper, SkeletonGrid } from '../components/ui';
import type { Tournament } from '../types';

export function TournamentListPage({ onNew, onOpen }: { onNew: () => void; onOpen: (id: string) => void }) {
  const { tournaments, loading } = useTournaments();

  return (
    <PageWrapper>
      {/* Hero */}
      <div className="relative mb-12 pt-8">
        <div className="pointer-events-none absolute inset-0 -top-8 bg-hero-glow" />
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-xs font-medium text-violet-400">
            <Trophy className="h-3 w-3" /> Système suisse
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-300 sm:text-5xl">
            Vos tournois
            <span className="gradient-text"> d'échecs</span>
          </h2>
          <p className="mt-3 max-w-xl text-slate-400">
            Créez, gérez et suivez vos tournois en présentiel. Appariements automatiques, classements en temps réel.
          </p>
        </div>
        <div className="mt-6">
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/40 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> Nouveau tournoi
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : tournaments.length === 0 ? (
        <EmptyState onNew={onNew} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} onOpen={() => onOpen(t.id)} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

function TournamentCard({ tournament, onOpen }: { tournament: Tournament; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group relative text-left rounded-2xl glass gradient-border p-5 transition-all duration-300 hover:glow-violet-sm hover:-translate-y-0.5"
    >
      <div className="mb-4 flex items-start justify-between">
        <Badge status={tournament.status} />
        <ArrowRight className="h-4 w-4 text-slate-600 transition-all group-hover:text-violet-400 group-hover:translate-x-0.5" />
      </div>

      <h3 className="mb-3 text-base font-semibold text-slate-400 leading-snug">{tournament.name}</h3>

      <div className="space-y-1.5">
        {tournament.location && (
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="h-3 w-3 shrink-0 text-slate-600" /> {tournament.location}
          </p>
        )}
        {tournament.start_date && (
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3 w-3 shrink-0 text-slate-600" />
            {new Date(tournament.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-4 text-xs">
        <span className="flex items-center gap-1.5 text-slate-500">
          <span className="font-mono text-slate-400">{tournament.total_rounds}</span> rondes
        </span>
        {tournament.status === 'in_progress' && (
          <span className="font-mono text-emerald-400">
            R{tournament.current_round}/{tournament.total_rounds}
          </span>
        )}
        {tournament.status === 'completed' && (
          <span className="text-slate-500">Terminé</span>
        )}
      </div>
    </button>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-8 py-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/10">
        <Trophy className="h-7 w-7 text-violet-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-200">Aucun tournoi pour l'instant</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500">Créez votre premier tournoi et invitez vos joueurs à s'inscrire.</p>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
      >
        <Plus className="h-4 w-4" /> Créer un tournoi
      </button>
    </div>
  );
}
