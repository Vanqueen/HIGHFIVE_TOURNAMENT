import { Trophy, User, ArrowRight } from 'lucide-react';
import { INK, GOLD, GOLD_DARK, PURPLE, GRAY } from './tokens';
import type { User as AuthUser } from '../../types';

function BarsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M5 20V12M12 20V6M19 20v-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoCard({ iconBg, icon, title, description, linkText, accent, onClick }: {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  accent: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex gap-[1.6em] rounded-[1.4em] border border-black/5 bg-white dark:bg-gray-700 p-[1.8em] shadow-[0_0.6em_1.6em_-1.4em_rgba(17,17,20,0.35)]">
      <div
        className="flex h-[4.6em] w-[4.6em] shrink-0 items-center justify-center rounded-[1.1em]"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-[1.5em] font-extrabold tracking-[0.01em] text-gray-700 dark:text-gray-300">{title}</h3>
        <p className="mt-[0.8em] text-[1.2em] leading-[1.45] text-gray-500 dark:text-gray-400">{description}</p>
        <button
          type="button"
          onClick={onClick}
          className="mt-[1em] inline-flex items-center gap-[0.5em] text-[1.1em] font-bold tracking-[0.06em] transition-opacity hover:opacity-70"
          style={{ color: accent }}
        >
          {linkText}
          <ArrowRight className="h-[1.2em] w-[1.2em]" />
        </button>
      </div>
    </div>
  );
}

export function AccessCardsSection({ user, onLogin, onDashboard }: {
  user: AuthUser | null;
  onLogin: () => void;
  onDashboard: () => void;
}) {
  return (
    <section className="flex-none px-[2.6em] pt-[1.6em] lg:px-[3.2em]">
      <div className="mx-auto grid max-w-[192em] grid-cols-1 gap-[1.6em] md:grid-cols-3">
        <InfoCard
          iconBg={PURPLE}
          icon={<User className="h-[1.9em] w-[1.9em] text-white" />}
          title="POUR LES JOUEURS"
          description="Inscrivez-vous aux tournois, suivez vos parties, améliorez votre classement et défiez des joueurs du monde entier."
          linkText={user ? 'MON ESPACE JOUEUR' : 'CRÉER UN COMPTE'}
          onClick={user ? onDashboard : onLogin}
          accent={PURPLE}
        />
        <InfoCard
          iconBg={GOLD}
          icon={<Trophy className="h-[1.9em] w-[1.9em] text-white" />}
          title="POUR LES ORGANISATEURS"
          description="Créez et gérez vos compétitions facilement. Notre plateforme s'occupe du reste."
          linkText={user?.role === 'organizer' ? 'CRÉER UNE COMPÉTITION' : 'ESPACE ORGANISATEUR'}
          onClick={user?.role === 'organizer' ? onDashboard : onLogin}
          accent={GOLD_DARK}
        />
        <InfoCard
          iconBg={INK}
          icon={<BarsIcon className="h-[1.9em] w-[1.9em] text-white" />}
          title="CLASSEMENTS EN TEMPS RÉEL"
          description="Suivez l'évolution des tournois et des joueurs en direct avec des statistiques détaillées."
          linkText="VOIR LES CLASSEMENTS"
          accent={GRAY}
        />
      </div>
    </section>
  );
}
