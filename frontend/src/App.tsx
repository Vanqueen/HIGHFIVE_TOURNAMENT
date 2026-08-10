import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import type { View } from './types';
import PageLoader from './PageLoader';

const PlayerDashboard = lazy(() => import('./pages/PlayerDashboard').then(m => ({ default: m.PlayerDashboard })));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard').then(m => ({ default: m.OrganizerDashboard })));
const TournamentCreatePage = lazy(() => import('./pages/TournamentCreatePage').then(m => ({ default: m.TournamentCreatePage })));
const TournamentDetailPage = lazy(() => import('./pages/TournamentDetailPage').then(m => ({ default: m.TournamentDetailPage })));
const StandingsPage = lazy(() => import('./pages/StandingsPage').then(m => ({ default: m.StandingsPage })));

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

function Router() {
  const { user, initializing } = useAuth();
  const [view, setView] = useState<View>({ name: 'landing' });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = window.localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  /* À la déconnexion, on ne peut plus rester sur un écran protégé. */
  useEffect(() => {
    if (!user && !initializing) {
      setView((current) =>
        current.name === 'landing' || current.name === 'auth' ? current : { name: 'landing' }
      );
    }
  }, [user, initializing]);

  const goHome = () => setView({ name: 'landing' });
  const goHomeWithNav = (item: import('./components/landing/tokens').NavItem) =>
    setView({ name: 'landing', nav: item });
  const goDashboard = () => setView({ name: 'dashboard' });

  /* Restauration de session en cours : éviter le flash « déconnecté ». */
  if (initializing) return <PageLoader />;

  if (view.name === 'landing') {
    return (
      <LandingPage
        user={user}
        onLogin={() => setView({ name: 'auth' })}
        onDashboard={goDashboard}
        onTournamentClick={(id) => setView({ name: 'detail', tournamentId: id })}
        theme={theme} onToggleTheme={toggleTheme}
        initialNav={view.nav}
      />
    );
  }

  if (view.name === 'auth') {
    if (user) return <RoleHome onNavigate={setView} theme={theme} onToggleTheme={toggleTheme} />;
    return (
      <AuthPage
        onBack={goHome}
        onAuthenticated={(u) => {
          if (u.must_change_password) setView({ name: 'change-password' });
          else goDashboard();
        }}
      />
    );
  }

  if (view.name === 'change-password') {
    if (!user) return <AuthPage onBack={goHome} onAuthenticated={goDashboard} />;
    return <ChangePasswordPage onDone={goDashboard} />;
  }

  if (!user) return <AuthPage onBack={goHome} onAuthenticated={goDashboard} />;

  if (view.name === 'dashboard') {
    return <RoleHome onNavigate={setView} theme={theme} onToggleTheme={toggleTheme} />;
  }

  /* Création de tournoi : réservée aux organisateurs. */
  if (view.name === 'create') {
    if (user.role !== 'organizer') return <RoleHome onNavigate={setView} theme={theme} onToggleTheme={toggleTheme} />;
    return (
      <AppShell onHome={goHome} onNav={goHomeWithNav} onDashboard={goDashboard} theme={theme} onToggleTheme={toggleTheme}>
        <Suspense fallback={<PageLoader />}>
          <TournamentCreatePage
            onBack={goDashboard}
            onCreated={(id) => setView({ name: 'detail', tournamentId: id })}
          />
        </Suspense>
      </AppShell>
    );
  }

  if (view.name === 'detail') {
    return (
      /* Console de gestion : pleine largeur, pleine hauteur, sans scroll de
         page — seul le panneau actif défile. */
      <AppShell wide fill onHome={goHome} onNav={goHomeWithNav} onDashboard={goDashboard} theme={theme} onToggleTheme={toggleTheme}>
        <Suspense fallback={<PageLoader />}>
          <TournamentDetailPage
            tournamentId={view.tournamentId}
            onBack={goDashboard}
            onViewStandings={(id) => setView({ name: 'standings', tournamentId: id })}
          />
        </Suspense>
      </AppShell>
    );
  }

  if (view.name === 'standings') {
    return (
      <AppShell onHome={goHome} onNav={goHomeWithNav} onDashboard={goDashboard} theme={theme} onToggleTheme={toggleTheme}>
        <Suspense fallback={<PageLoader />}>
          <StandingsPage
            tournamentId={view.tournamentId}
            onBack={() => setView({ name: 'detail', tournamentId: view.tournamentId })}
          />
        </Suspense>
      </AppShell>
    );
  }

  return <RoleHome onNavigate={setView} theme={theme} onToggleTheme={toggleTheme} />;
}

/* Aiguillage vers l'espace correspondant au rôle. */
function RoleHome({
  onNavigate,
  theme,
  onToggleTheme,
}: {
  onNavigate: (view: View) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}) {
  const { user } = useAuth();
  const goHome = () => onNavigate({ name: 'landing' });
  const goSection = (item: import('./components/landing/tokens').NavItem) =>
    onNavigate({ name: 'landing', nav: item });

  if (user?.role === 'organizer') {
    return (
      <Suspense fallback={<PageLoader />}>
        <OrganizerDashboard
          theme={theme} onToggleTheme={onToggleTheme}
          onHome={goHome}
          onNav={goSection}
          onNewTournament={() => onNavigate({ name: 'create' })}
          onOpenTournament={(id) => onNavigate({ name: 'detail', tournamentId: id })}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <PlayerDashboard
        theme={theme} onToggleTheme={onToggleTheme}
        onHome={goHome}
        onNav={goSection}
        onOpenTournament={(id) => onNavigate({ name: 'detail', tournamentId: id })}
      />
    </Suspense>
  );
}
