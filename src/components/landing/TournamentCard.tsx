import { MapPin, ArrowRight } from 'lucide-react';
import { GOLD, GOLD_DARK, GREEN, PURPLE } from './tokens';
import type { Tournament } from '../../types';
import chessHeroImage from '../../assets/image.png';

function formatDate(value: string) {
  return new Date(value)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    .toUpperCase();
}

function statusBadge(status: Tournament['status']) {
  switch (status) {
    case 'registration': return { label: 'INSCRIPTIONS OUVERTES', color: GREEN };
    case 'in_progress':  return { label: 'EN COURS', color: GOLD_DARK };
    case 'completed':    return { label: 'TERMINÉ', color: '#6B7280' };
    default:             return { label: 'À VENIR', color: PURPLE };
  }
}

export function TournamentCard({ tournament, crop, onClick }: {
  tournament: Tournament;
  crop: string;
  onClick: () => void;
}) {
  const badge = statusBadge(tournament.status);

  return (
    <button
      onClick={onClick}
      className="group flex overflow-hidden rounded-[1.2em] border border-black/5 bg-white text-left shadow-[0_0.6em_1.6em_-1.2em_rgba(17,17,20,0.4)] transition-shadow hover:shadow-[0_1.4em_2.8em_-1.4em_rgba(17,17,20,0.45)]"
    >
      <img
        src={chessHeroImage}
        alt=""
        aria-hidden="true"
        className="h-auto w-[8.4em] shrink-0 self-stretch object-cover"
        style={{ objectPosition: crop }}
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between p-[1.2em]">
        <div className="min-w-0">
          <span
            className="inline-block rounded-full px-[0.9em] py-[0.35em] text-[0.95em] font-bold tracking-[0.06em] text-white"
            style={{ backgroundColor: badge.color }}
          >
            {badge.label}
          </span>
          <h3 className="mt-[0.9em] truncate text-[1.4em] font-extrabold tracking-[-0.01em]">{tournament.name}</h3>
          {tournament.start_date && (
            <p className="mt-[0.7em] text-[1.1em] text-gray-500">{formatDate(tournament.start_date)}</p>
          )}
        </div>
        <div className="mt-[0.9em] flex items-end justify-between gap-[0.8em]">
          <div className="flex min-w-0 items-center gap-[0.5em] text-[1.05em] text-gray-500">
            <MapPin className="h-[1.2em] w-[1.2em] shrink-0" style={{ color: GOLD }} />
            <span className="truncate">
              {(tournament.location ?? 'À définir').toUpperCase()} — {tournament.total_rounds} RONDES
            </span>
          </div>
          <span className="flex h-[3em] w-[3em] shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-800 transition-transform group-hover:translate-x-[0.15em]">
            <ArrowRight className="h-[1.4em] w-[1.4em]" />
          </span>
        </div>
      </div>
    </button>
  );
}
