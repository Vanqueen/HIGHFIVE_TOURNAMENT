import { ArrowRight, ChevronRight } from 'lucide-react';
import { INK, GOLD, THUMB_CROPS } from './tokens';
import { TournamentCard } from './TournamentCard';
import type { Tournament } from '../../types';

export function UpcomingTournamentsSection({
  tournaments,
  loading,
  featuredIndex,
  goTo,
  onTournamentClick,
}: {
  tournaments: Tournament[];
  loading: boolean;
  featuredIndex: number;
  goTo: (next: number, dir: 'left' | 'right') => void;
  onTournamentClick: (id: string) => void;
}) {
  const upcoming = tournaments.slice(0, 4);

  return (
    <section id="prochains-tournois" className="flex-none px-[2.6em] lg:px-[3.2em]">
      <div className="relative mx-auto max-w-[192em] rounded-[1.6em] border border-black/5 bg-[#FBFAF9] px-[2em] py-[1.6em]">
        <div className="mb-[1.4em] flex items-center justify-between">
          <h2 className="flex items-center gap-[0.4em] text-[1.7em] font-extrabold tracking-[-0.01em]">
            <ChevronRight className="h-[1.1em] w-[1.1em]" style={{ color: GOLD }} strokeWidth={3} />
            PROCHAINS TOURNOIS
          </h2>
          <a
            href="#"
            className="flex items-center gap-[0.5em] text-[1.15em] font-semibold tracking-[0.06em] text-gray-500 transition-colors hover:text-gray-800"
          >
            VOIR TOUS LES TOURNOIS
            <ArrowRight className="h-[1.2em] w-[1.2em]" />
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-[1.4em] sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-[13.5em] rounded-[1.2em]" />
            ))}
          </div>
        ) : upcoming.length > 0 ? (
          <div className="grid grid-cols-1 gap-[1.4em] sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((tournament, i) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                crop={THUMB_CROPS[i % THUMB_CROPS.length]}
                onClick={() => onTournamentClick(tournament.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-[13.5em] items-center justify-center text-[1.4em] text-gray-400">
            Aucun tournoi à venir pour le moment
          </div>
        )}

        <button
          onClick={() => goTo((featuredIndex + 1) % Math.max(tournaments.length, 1), 'left')}
          className="absolute right-[-1.7em] top-[64%] hidden h-[3.4em] w-[3.4em] items-center justify-center rounded-full text-white shadow-[0_1em_2em_-0.6em_rgba(17,17,20,0.6)] transition-transform hover:scale-105 lg:flex"
          style={{ backgroundColor: INK }}
          aria-label="Tournoi suivant"
        >
          <ChevronRight className="h-[1.6em] w-[1.6em]" />
        </button>
      </div>
    </section>
  );
}
