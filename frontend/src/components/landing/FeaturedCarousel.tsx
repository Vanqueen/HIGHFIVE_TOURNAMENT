import { Calendar, MapPin, ArrowRight, Trophy } from 'lucide-react';
import { GOLD, PURPLE, INK } from './tokens';
import type { Tournament } from '../../types';

function SplitTitle({ name }: { name: string }) {
  const [first, ...rest] = name.trim().split(' ');
  return (
    <>
      <span className="block text-gray-950 dark:text-gray-400">{first.toUpperCase()}</span>
      {rest.length > 0 && (
        <span className="block" style={{ color: GOLD }}>
          {rest.join(' ').toUpperCase()}
        </span>
      )}
    </>
  );
}

function formatDate(value: string) {
  return new Date(value)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    .toUpperCase();
}

function CardContent({
  tournament,
  onTournamentClick,
  tournaments,
  featuredIndex,
  goTo,
}: {
  tournament: Tournament;
  onTournamentClick: (id: string) => void;
  tournaments: Tournament[];
  featuredIndex: number;
  goTo: (next: number, dir: 'left' | 'right') => void;
}) {
  return (
    <>
      <span
        className="inline-block rounded-full px-[1.2em] py-[0.5em] text-[1.05em] font-bold tracking-[0.1em] text-white"
        style={{ backgroundColor: GOLD }}
      >
        ÉVÉNEMENT PHARE
      </span>
      <Trophy className="mx-auto mt-[1.6em] h-[3.4em] w-[3.4em]" style={{ color: GOLD }} strokeWidth={1.6} />
      <h3 className="mt-[1em] text-[2em] font-extrabold leading-[1.15] tracking-[-0.01em]">
        <SplitTitle name={tournament.name} />
      </h3>

      <div className="mt-[1.4em] space-y-[0.8em] text-left text-[1.2em] text-gray-600">
        {tournament.start_date && (
          <div className="flex items-center gap-[0.8em]">
            <Calendar className="h-[1.35em] w-[1.35em] shrink-0" style={{ color: GOLD }} />
            <span>{formatDate(tournament.start_date)}</span>
          </div>
        )}
        <div className="flex items-center gap-[0.8em]">
          <MapPin className="h-[1.35em] w-[1.35em] shrink-0" style={{ color: GOLD }} />
          <span>{(tournament.location ?? 'À définir').toUpperCase()} — {tournament.total_rounds} RONDES</span>
        </div>
      </div>
      <button
        onClick={() => onTournamentClick(tournament.id)}
        className="mt-[1.8em] flex w-full items-center justify-center gap-[0.7em] rounded-full py-[1.15em] text-[1.15em] font-bold tracking-[0.08em] text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: INK }}
      >
        EN SAVOIR PLUS
        <ArrowRight className="h-[1.3em] w-[1.3em]" />
      </button>
      <div className="mt-[1.4em] flex justify-center gap-[0.6em]">
        {tournaments.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > featuredIndex ? 'left' : 'right')}
            className="h-[0.6em] w-[0.6em] rounded-full transition-colors"
            style={{ backgroundColor: i === featuredIndex ? INK : '#D8D8DC' }}
            aria-label={`Tournoi ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}

export function FeaturedCarousel({
  tournaments,
  featuredIndex,
  prevIndex,
  slideDir,
  animating,
  goTo,
  onTournamentClick,
}: {
  tournaments: Tournament[];
  featuredIndex: number;
  prevIndex: number | null;
  slideDir: 'left' | 'right';
  animating: boolean;
  goTo: (next: number, dir: 'left' | 'right') => void;
  onTournamentClick: (id: string) => void;
}) {
  if (tournaments.length === 0) return null;

  return (
    <div
      className="absolute right-[3.6em] top-1/2 z-20 hidden w-[25em] -translate-y-1/2 rounded-[1.6em] border border-black/5 bg-white dark:bg-gray-700 shadow-[0_2.4em_5em_-1.6em_rgba(17,17,20,0.35)] lg:block"
      style={{ overflow: 'hidden' }}
    >
      {prevIndex !== null && (
        <div
          className="absolute inset-0 p-[2em] text-center"
          style={{ animation: `carousel-exit-${slideDir} 0.48s cubic-bezier(0.4,0,0.2,1) forwards` }}
        >
          <CardContent
            tournament={tournaments[prevIndex]}
            onTournamentClick={onTournamentClick}
            tournaments={tournaments}
            featuredIndex={prevIndex}
            goTo={goTo}
          />
        </div>
      )}
      <div
        key={featuredIndex}
        className="p-[2em] text-center"
        style={{
          animation: animating
            ? `carousel-enter-${slideDir} 0.48s cubic-bezier(0.4,0,0.2,1) forwards`
            : undefined,
        }}
      >
        <CardContent
          tournament={tournaments[featuredIndex]}
          onTournamentClick={onTournamentClick}
          tournaments={tournaments}
          featuredIndex={featuredIndex}
          goTo={goTo}
        />
      </div>
    </div>
  );
}
