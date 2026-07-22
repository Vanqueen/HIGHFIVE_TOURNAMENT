import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AppShell } from './components/AppShell';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { PlayerDashboard } from './pages/PlayerDashboard';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { TournamentCreatePage } from './pages/TournamentCreatePage';
import { TournamentDetailPage } from './pages/TournamentDetailPage';
import { StandingsPage } from './pages/StandingsPage';
import type { View } from './types';

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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const nextTheme = stored === 'dark' || stored === 'light' ? stored : system;
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));


  /* Le thème sombre n'est pas utilisé par les écrans publics : on force
     le clair, qui correspond à la charte de la vitrine. */
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }, []);

  /* À la déconnexion, on ne peut plus rester sur un écran protégé. */
  useEffect(() => {
    if (!user && !initializing) {
      setView((current) =>
        current.name === 'landing' || current.name === 'auth' ? current : { name: 'landing' }
      );
    }
  }, [user, initializing]);

  const goHome = () => setView({ name: 'landing' });
  const goDashboard = () => setView({ name: 'dashboard' });

  /* Restauration de session en cours : éviter le flash « déconnecté ». */
  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#C6963B' }} />
      </div>
    );
  }

  if (view.name === 'landing') {
    return (
      <LandingPage
        user={user}
        onLogin={() => setView({ name: 'auth' })}
        onDashboard={goDashboard}
        onTournamentClick={(id) => setView({ name: 'detail', tournamentId: id })}
        theme={theme} onToggleTheme={toggleTheme}
      />
    );
  }

  if (view.name === 'auth') {
    /* Déjà connecté : l'écran d'auth n'a plus lieu d'être. */
    if (user) return <RoleHome onNavigate={setView} />;
    return <AuthPage onBack={goHome} onAuthenticated={goDashboard} />;
  }

  /* Tout ce qui suit exige une session. */
  if (!user) {
    return <AuthPage onBack={goHome} onAuthenticated={goDashboard} />;
  }

  if (view.name === 'dashboard') {
    return <RoleHome onNavigate={setView} />;
  }

  /* Création de tournoi : réservée aux organisateurs. */
  if (view.name === 'create') {
    if (user.role !== 'organizer') return <RoleHome onNavigate={setView} />;
    return (
      <AppShell onHome={goHome}>
        <TournamentCreatePage
          onBack={goDashboard}
          onCreated={(id) => setView({ name: 'detail', tournamentId: id })}
        />
      </AppShell>
    );
  }

  if (view.name === 'detail') {
    return (
      /* Console de gestion : pleine largeur, pleine hauteur, sans scroll de
         page — seul le panneau actif défile. */
      <AppShell wide fill onHome={goHome}>
        <TournamentDetailPage
          tournamentId={view.tournamentId}
          onBack={goDashboard}
          onViewStandings={(id) => setView({ name: 'standings', tournamentId: id })}
        />
      </AppShell>
    );
  }

  if (view.name === 'standings') {
    return (
      <AppShell onHome={goHome}>
        <StandingsPage
          tournamentId={view.tournamentId}
          onBack={() => setView({ name: 'detail', tournamentId: view.tournamentId })}
        />
      </AppShell>
    );
  }

  return <RoleHome onNavigate={setView} />;
}

/* Aiguillage vers l'espace correspondant au rôle. */
function RoleHome({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { user } = useAuth();
  const goHome = () => onNavigate({ name: 'landing' });

  if (user?.role === 'organizer') {
    return (
      <OrganizerDashboard
        onHome={goHome}
        onNewTournament={() => onNavigate({ name: 'create' })}
        onOpenTournament={(id) => onNavigate({ name: 'detail', tournamentId: id })}
      />
    );
  }

  return (
    <PlayerDashboard
      onHome={goHome}
      onOpenTournament={(id) => onNavigate({ name: 'detail', tournamentId: id })}
    />
  );
}
