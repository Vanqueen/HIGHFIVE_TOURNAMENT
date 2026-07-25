import { useEffect, useState } from 'react';
import { useTournaments } from '../hooks/useTournaments';
import { useAuth } from '../hooks/useAuth';
import type { User as AuthUser } from '../types';
import type { Tournament } from '../types';
import { LandingHeader } from '../components/landing/LandingHeader';
import { HeroSection } from '../components/landing/HeroSection';
import { UpcomingTournamentsSection } from '../components/landing/UpcomingTournamentsSection';
import { AccessCardsSection } from '../components/landing/AccessCardsSection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { ClassementsPage } from './ClassementsPage';
import { JoueursPage } from './JoueursPage';
import { TournamentListPage } from './TournamentListPage';
import { AboutPage } from './AboutPage';
import { CalendarPage } from './CalendarPage';
import { TournamentRegisterModal } from '../components/TournamentRegisterModal';
import { INK } from '../components/landing/tokens';
import type { NavItem } from '../components/landing/tokens';

export function LandingPage({
  user,
  onLogin,
  onDashboard,
  onTournamentClick,
  theme, 
  onToggleTheme,
  initialNav,
  onNavConsumed,
}: {
  user: AuthUser | null;
  onLogin: () => void;
  onDashboard: () => void;
  onTournamentClick: (id: string) => void;
  theme: 'dark' | 'light'; 
  onToggleTheme: () => void;
  initialNav?: NavItem;
  onNavConsumed?: () => void;
}) {
  const { tournaments, loading } = useTournaments();
  const { logout } = useAuth();
  const [activeNav, setActiveNav] = useState<NavItem>('Accueil');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
  const [animating, setAnimating] = useState(false);
  const [registerTournament, setRegisterTournament] = useState<Tournament | null>(null);

  /* Si non connecté, ouvre le modal d'inscription au tournoi au lieu de naviguer. */
  const handleTournamentClick = (id: string) => {
    if (user) {
      onTournamentClick(id);
    } else {
      const t = tournaments.find((t) => t.id === id) ?? null;
      setRegisterTournament(t);
    }
  };

  /* Consommer initialNav au montage ou quand il change */
  useEffect(() => {
    if (initialNav) {
      setActiveNav(initialNav);
      onNavConsumed?.();
    }
  }, [initialNav]);

  const goTo = (next: number, dir: 'left' | 'right' = 'left') => {
    if (animating || next === featuredIndex || tournaments.length <= 1) return;
    setSlideDir(dir);
    setPrevIndex(featuredIndex);
    setFeaturedIndex(next);
    setAnimating(true);
    setTimeout(() => { setPrevIndex(null); setAnimating(false); }, 480);
  };

  /* landing-lock uniquement sur la page d'accueil */
  useEffect(() => {
    if (activeNav === 'Accueil') {
      document.documentElement.classList.add('landing-lock');
    } else {
      document.documentElement.classList.remove('landing-lock');
    }
    return () => document.documentElement.classList.remove('landing-lock');
  }, [activeNav]);

  useEffect(() => {
    if (tournaments.length <= 1) return;
    const timer = setInterval(() => {
      setFeaturedIndex((i) => {
        const next = (i + 1) % tournaments.length;
        setSlideDir('left');
        setPrevIndex(i);
        setAnimating(true);
        setTimeout(() => { setPrevIndex(null); setAnimating(false); }, 480);
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [tournaments.length]);

  const isHome = activeNav === 'Accueil';

  return (
    <div
      className={isHome ? 'landing-scale landing-fixed flex flex-col' : 'landing-scale flex flex-col overflow-hidden'}
      style={{ color: INK }}
    >
      {registerTournament && (
        <TournamentRegisterModal
          tournament={registerTournament}
          onClose={() => setRegisterTournament(null)}
          onLogin={() => { setRegisterTournament(null); onLogin(); }}
        />
      )}
      <LandingHeader
        user={user}
        onLogin={onLogin}
        onDashboard={onDashboard}
        onLogout={logout}
        activeNav={activeNav}
        onNav={setActiveNav}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {activeNav === 'Accueil' && (
        <div className="flex min-h-0 flex-1 flex-col bg-[color:var(--app-bg)] dark:bg-[#251c3a]">
          <HeroSection
            tournaments={tournaments}
            featuredIndex={featuredIndex}
            prevIndex={prevIndex}
            slideDir={slideDir}
            animating={animating}
            goTo={goTo}
            onTournamentClick={handleTournamentClick}
            onSeeCalendar={() => setActiveNav('Calendrier')}
            onSeeTournaments={() => setActiveNav('Tournois')}
          />
          <UpcomingTournamentsSection
            tournaments={tournaments}
            loading={loading}
            featuredIndex={featuredIndex}
            goTo={goTo}
            onTournamentClick={handleTournamentClick}
          />
          <AccessCardsSection user={user} onLogin={onLogin} onDashboard={onDashboard} />
          <LandingFooter />
        </div>
      )}

      {activeNav !== 'Accueil' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {activeNav === 'Tournois' && (
            <TournamentListPage onNew={onLogin} onOpen={handleTournamentClick} />
          )}
          {activeNav === 'Calendrier' && (
            <CalendarPage onTournamentClick={handleTournamentClick} />
          )}
          {activeNav === 'Classements' && (
            <ClassementsPage onTournamentClick={onTournamentClick} />
          )}
          {activeNav === 'À propos' && (
            <AboutPage
              user={user}
              onLogin={onLogin}
              onDashboard={onDashboard}
              onSeeTournaments={() => setActiveNav('Tournois')}
            />
          )}
        </div>
      )}
    </div>
  );
}
