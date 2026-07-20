import { useEffect, useState } from 'react';
import { Header } from './components/ui';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { TournamentListPage } from './pages/TournamentListPage';
import { TournamentCreatePage } from './pages/TournamentCreatePage';
import { TournamentDetailPage } from './pages/TournamentDetailPage';
import { StandingsPage } from './pages/StandingsPage';
import type { View } from './types';

export default function App() {
  const [view, setView] = useState<View>({ name: 'landing' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

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

  const handleLogin = () => {
    setView({ name: 'login' });
  };

  const handleAuthenticate = () => {
    setIsAdmin(true);
    setView({ name: 'list' });
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setView({ name: 'landing' });
  };

  // Landing page - pas de header personnalisé, elle a son propre header
  if (view.name === 'landing') {
    return (
      <LandingPage 
        onLogin={handleLogin}
        onTournamentClick={(id) => setView({ name: 'detail', tournamentId: id })}
      />
    );
  }

  // Login page - page séparée
  if (view.name === 'login') {
    return (
      <LoginPage 
        onLogin={handleAuthenticate}
        onBack={() => setView({ name: 'landing' })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--app-bg)] text-[color:var(--text-primary)] transition-colors duration-300">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {view.name === 'list' && (
          <TournamentListPage
            onNew={() => setView({ name: 'create' })}
            onOpen={(id) => setView({ name: 'detail', tournamentId: id })}
            isAdmin={isAdmin}
            onLogout={handleLogout}
          />
        )}
        {view.name === 'create' && (
          <TournamentCreatePage
            onBack={() => setView({ name: 'list' })}
            onCreated={(id) => setView({ name: 'detail', tournamentId: id })}
          />
        )}
        {view.name === 'detail' && (
          <TournamentDetailPage
            tournamentId={view.tournamentId}
            onBack={() => setView({ name: 'list' })}
            onViewStandings={(id) => setView({ name: 'standings', tournamentId: id })}
          />
        )}
        {view.name === 'standings' && (
          <StandingsPage
            tournamentId={view.tournamentId}
            onBack={() => setView({ name: 'detail', tournamentId: view.tournamentId })}
          />
        )}
      </main>
    </div>
  );
}
