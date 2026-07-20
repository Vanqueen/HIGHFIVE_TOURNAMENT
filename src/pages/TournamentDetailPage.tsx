import { useState } from 'react';
import { Trophy, Users, Calendar, MapPin, Crown, ClipboardList, BarChart3, ChevronRight, Zap } from 'lucide-react';
import { useTournamentDetail } from '../hooks/useTournamentDetail';
import { BackButton, Badge, PageWrapper, TabButton } from '../components/ui';
import { PlayersTab } from '../components/PlayersTab';
import { RoundsTab } from '../components/RoundsTab';
import { Podium } from '../components/Podium';

export function TournamentDetailPage({ tournamentId, onBack, onViewStandings }: {
  tournamentId: string;
  onBack: () => void;
  onViewStandings: (id: string) => void;
}) {
  const { tournament, players, matches, loading, load, startTournament, nextRound, completeTournament, setMatchResult } = useTournamentDetail(tournamentId);
  const [tab, setTab] = useState<'players' | 'rounds'>('players');
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  if (loading || !tournament) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  const allResultsIn = matches.filter((m) => m.round === tournament.current_round).every((m) => m.result !== 'pending');
  const isLastRound = tournament.current_round >= tournament.total_rounds;

  return (
    <PageWrapper>
      <BackButton onClick={onBack} />

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2">
            <Badge status={tournament.status} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-300">{tournament.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            {tournament.location && (
              <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {tournament.location}</span>
            )}
            {tournament.start_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {new Date(tournament.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            <span className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {players.length} joueurs</span>
          </div>
        </div>
        <button
          onClick={() => onViewStandings(tournamentId)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:text-slate-100 hover:bg-slate-800"
        >
          <BarChart3 className="h-4 w-4" /> Classement
        </button>
      </div>

      {/* Status banners */}
      {tournament.status === 'registration' && (
        <div className="mb-6 rounded-2xl border border-amber-500/15 bg-amber-500/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-300">Phase d'inscriptions</p>
              <p className="mt-1 text-sm text-amber-400/70">
                Ajoutez les joueurs puis lancez le tournoi pour générer la première ronde (système suisse).
              </p>
            </div>
            <button
              onClick={startTournament} disabled={players.length < 2}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Crown className="h-4 w-4" /> Lancer
            </button>
          </div>
        </div>
      )}

      {tournament.status === 'in_progress' && (
        <div className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  Ronde <span className="font-mono text-emerald-400">{tournament.current_round}</span>
                  <span className="text-slate-500"> / {tournament.total_rounds}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {allResultsIn ? 'Tous les résultats saisis.' : 'En attente des résultats.'}
                  {isLastRound && allResultsIn && ' Dernière ronde terminée.'}
                </p>
              </div>
            </div>
            {allResultsIn && !isLastRound && (
              <button onClick={nextRound} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all">
                Ronde suivante <ChevronRight className="h-4 w-4" />
              </button>
            )}
            {allResultsIn && isLastRound && (
              <button onClick={completeTournament} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition-all">
                <Trophy className="h-4 w-4" /> Terminer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-slate-800/60">
        <TabButton active={tab === 'players'} onClick={() => setTab('players')} icon={<Users className="h-4 w-4" />} label="Joueurs" />
        <TabButton active={tab === 'rounds'} onClick={() => setTab('rounds')} icon={<ClipboardList className="h-4 w-4" />} label="Rondes" />
      </div>

      {tab === 'players' && (
        <PlayersTab tournament={tournament} players={players} onChange={load} showAdd={showAddPlayer} setShowAdd={setShowAddPlayer} />
      )}
      {tab === 'rounds' && (
        <RoundsTab tournament={tournament} players={players} matches={matches} onSetResult={setMatchResult} />
      )}

      {tournament.status === 'completed' && <Podium tournamentId={tournamentId} />}
    </PageWrapper>
  );
}
