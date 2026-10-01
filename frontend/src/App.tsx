import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import type { View } from './types';
import { NAV_ITEMS } from './components/landing/tokens';
import type { NavItem } from './components/landing/tokens';
import PageLoader from './PageLoader';
import { AuthProvider } from './provider/AuthContext';

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
  const [view, setView] = useState<View>(() => readViewFromUrl());
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

  const navigate = (next: View, replace = false) => {
    const path = pathForView(next);
    if (window.location.pathname + window.location.search !== path) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
    }
    setView(next);
  };

  useEffect(() => {
    const handlePopState = () => setView(readViewFromUrl());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  /* À la déconnexion, on ne peut plus rester sur un écran protégé. */
  useEffect(() => {
    if (!user && !initializing) {
      setView((current) => {
        if (current.name === 'landing' || current.name === 'auth') return current;
        window.history.replaceState({}, '', '/');
        return { name: 'landing' };
      });
    }
  }, [user, initializing]);

  const goHome = () => navigate({ name: 'landing' });
  const goHomeWithNav = (item: import('./components/landing/tokens').NavItem) =>
    navigate({ name: 'landing', nav: item });
  const goDashboard = () => navigate({ name: 'dashboard' });

  /* Restauration de session en cours : éviter le flash « déconnecté ». */
  if (initializing) return <PageLoader />;

  if (view.name === 'landing') {
    return (
      <LandingPage
        user={user}
        onLogin={() => navigate({ name: 'auth' })}
        onDashboard={goDashboard}
        onTournamentClick={(id) => navigate({ name: 'detail', tournamentId: id })}
        theme={theme} onToggleTheme={toggleTheme}
        initialNav={view.nav}
      />
    );
  }

  if (view.name === 'auth') {
    if (user) return <RoleHome onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />;
    return (
      <AuthPage
        onBack={goHome}
        onAuthenticated={(u) => {
          if (u.must_change_password) navigate({ name: 'change-password' });
          else goDashboard();
        }}
      />
    );
  }

  if (view.name === 'change-password') {
    if (!user) return <AuthPage onBack={goHome} onAuthenticated={goDashboard} />;
    return (
      <AuthPage
        initialMode="change-password"
        onBack={goDashboard}
        onAuthenticated={goDashboard}
        onPasswordChanged={goDashboard}
      />
    );
  }

  if (!user) return <AuthPage onBack={goHome} onAuthenticated={goDashboard} />;

  if (view.name === 'dashboard') {
    return <RoleHome onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />;
  }

  /* Création de tournoi : réservée aux organisateurs. */
  if (view.name === 'create') {
    if (user.role !== 'organizer') return <RoleHome onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />;
    return (
      <AppShell onHome={goHome} onNav={goHomeWithNav} onDashboard={goDashboard} theme={theme} onToggleTheme={toggleTheme}>
        <Suspense fallback={<PageLoader />}>
          <TournamentCreatePage
            onBack={goDashboard}
            onCreated={(id) => navigate({ name: 'detail', tournamentId: id })}
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
            onViewStandings={(id) => navigate({ name: 'standings', tournamentId: id })}
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
            onBack={() => navigate({ name: 'detail', tournamentId: view.tournamentId })}
          />
        </Suspense>
      </AppShell>
    );
  }

  return <RoleHome onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />;
}

function readViewFromUrl(): View {
  const { pathname, searchParams } = new URL(window.location.href);
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/login') return { name: 'auth' };
  if (path === '/dashboard') return { name: 'dashboard' };
  if (path === '/change-password') return { name: 'change-password' };
  if (path === '/tournaments/new') return { name: 'create' };
  if (path === '/tournaments') return { name: 'landing', nav: 'Tournois' };

  const standings = path.match(/^\/tournaments\/([^/]+)\/standings$/);
  if (standings) return { name: 'standings', tournamentId: decodeURIComponent(standings[1]) };

  const detail = path.match(/^\/tournaments\/([^/]+)$/);
  if (detail) return { name: 'detail', tournamentId: decodeURIComponent(detail[1]) };

  const nav = searchParams.get('section');
  if (nav && NAV_ITEMS.includes(nav as NavItem)) return { name: 'landing', nav: nav as NavItem };
  return { name: 'landing' };
}

function pathForView(view: View): string {
  switch (view.name) {
    case 'auth': return '/login';
    case 'dashboard': return '/dashboard';
    case 'change-password': return '/change-password';
    case 'create': return '/tournaments/new';
    case 'detail': return `/tournaments/${encodeURIComponent(view.tournamentId)}`;
    case 'standings': return `/tournaments/${encodeURIComponent(view.tournamentId)}/standings`;
    case 'landing': return view.nav ? `/?section=${encodeURIComponent(view.nav)}` : '/';
    case 'list': return '/?section=Tournois';
  }
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
