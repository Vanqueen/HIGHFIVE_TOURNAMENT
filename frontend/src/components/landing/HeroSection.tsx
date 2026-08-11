import { Trophy, Users, Globe2, Calendar, ChevronRight, MapPin } from 'lucide-react';
import { INK, GOLD } from './tokens';
import { FeaturedCarousel } from './FeaturedCarousel';
import type { Tournament } from '../../types';
import chessHeroImage from '../../assets/image.png';

function Divider() {
  return <div className="mx-[1.6em] h-[3.2em] w-px bg-gray-200" />;
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-[1em]">
      <div className="shrink-0" style={{ color: GOLD }}>{icon}</div>
      <div className="leading-none">
        <div className="text-[1.9em] font-extrabold tracking-[-0.02em] text-gray-700 dark:text-gray-300">{value}</div>
        <div className="mt-[0.5em] text-[1.05em] font-semibold tracking-[0.08em] text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function ChessKnightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path
        d="M7 22h11l-1-3H9.5L9 16h6c1.5-3.5.5-7-2-9-1.6-1.3-2.5-2.5-2.5-4.5C8 4 6 6 6 9c0 1.8 1 2.7 2 3.5-1.3.3-3 1.5-3 4.5v2l-1 1v2h3Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroSection({
  tournaments,
  featuredIndex,
  prevIndex,
  slideDir,
  animating,
  goTo,
  onTournamentClick,
  onSeeCalendar,
  onSeeTournaments,
}: {
  tournaments: Tournament[];
  featuredIndex: number;
  prevIndex: number | null;
  slideDir: 'left' | 'right';
  animating: boolean;
  goTo: (next: number, dir: 'left' | 'right') => void;
  onTournamentClick: (id: string) => void;
  onSeeCalendar: () => void;
  onSeeTournaments: () => void;
}) {

  return (
    <section className="relative flex min-h-0 flex-1 items-center overflow-hidden bg-white dark:bg-gray-700">
      {/* Visuel */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[65%]">
        <img
          src={chessHeroImage}
          alt="Échiquier et pièces"
          className="h-full w-full object-cover object-[center_46%]"
          decoding="async"
          loading="eager"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,0.85) 38%, #000 52%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,0.85) 38%, #000 52%)',
          }}
        />
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 62% 40%, ${GOLD}22 0%, transparent 58%)` }} />
        <div className="absolute inset-x-0 bottom-0 h-[28%]" style={{ background: 'linear-gradient(to top, #fff 6%, rgba(255,255,255,0) 20%)' }} />
      </div>

      {/* Texte */}
      <div className="relative z-10 mx-auto flex w-full max-w-[192em] items-center px-[2.6em] lg:px-[6em]">
        <div className="max-w-[62em]">
          <h1 className="mt-[0.55em] text-[5.4em] font-extrabold leading-[1.03] tracking-[-0.025em] text-[color:var(--text-primary)]">
            LÀ OÙ LA STRATÉGIE
            <br />
            <span style={{ color: GOLD }}>CRÉE LA LÉGENDE</span>
          </h1>

          <p className="mt-[2.2em] max-w-[52em] text-[1.6em] leading-[1.6] text-gray-500">
            Le Chess Club regroupe les collaborateurs de VIPP Digital Services : une plateforme née en
            interne, entre passionnés. Participez, suivez et vibrez au rythme de nos compétitions.
          </p>

          <div className="mt-[2.6em] flex flex-wrap gap-[1.4em]">
            <button
              onClick={onSeeTournaments}
              className="flex items-center gap-[0.8em] rounded-full px-[2.4em] py-[1.25em] text-[1.3em] font-bold tracking-[0.06em] text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: INK }}
            >
              <ChessKnightIcon className="h-[1.5em] w-[1.5em]" />
              DÉCOUVRIR LES TOURNOIS
            </button>
            <button
              onClick={onSeeCalendar}
              className="flex items-center gap-[0.8em] rounded-full border border-gray-300 px-[2.4em] py-[1.25em] text-[1.3em] font-bold tracking-[0.06em] text-gray-800 transition-colors hover:border-gray-400"
            >
              <Calendar className="h-[1.5em] w-[1.5em]" style={{ color: GOLD }} />
              VOIR LE CALENDRIER
            </button>
          </div>

          <div className="mt-[3.4em] flex flex-wrap items-center gap-x-0 gap-y-[1.2em]">
            <StatItem icon={<Users className="h-[2.4em] w-[2.4em]" />} value="PLUSIEURS" label="JOUEURS" />
            <Divider />
            <StatItem icon={<Trophy className="h-[2.4em] w-[2.4em]" />} value="1er" label="TOURNOIS" />
            <Divider />
            <StatItem icon={<MapPin className="h-[2.4em] w-[2.4em]" />} value="À" label="VIPP" />
            <Divider />
            <StatItem icon={<Calendar className="h-[2.4em] w-[2.4em]" />} value="À VENIR" label="DE GRANDES ÉDITIONS" />
          </div>
        </div>
      </div>

      <FeaturedCarousel
        tournaments={tournaments}
        featuredIndex={featuredIndex}
        prevIndex={prevIndex}
        slideDir={slideDir}
        animating={animating}
        goTo={goTo}
        onTournamentClick={onTournamentClick}
      />
    </section>
  );
}
