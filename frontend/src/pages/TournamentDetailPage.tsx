import { useState } from 'react';
import {
  Users,
  Calendar,
  MapPin,
  ClipboardList,
  BarChart3,
  GitBranch,
  ArrowLeft,
  ArrowRight,
  Trophy,
  AlertCircle,
  Loader2,
  Flag,
} from 'lucide-react';
import { useTournamentDetail } from '../hooks/useTournamentDetail';
import { useAuth } from '../hooks/useAuth';
import { PlayersTab } from '../components/PlayersTab';
import { RoundsTab } from '../components/RoundsTab';
import { Bracket } from '../components/Bracket';
import { Podium } from '../components/Podium';
import { StatusTag, INK, GOLD, GREEN, RULE } from '../components/Scoreboard';
import { bracketRounds, matchWinnerId, roundLabel } from '../lib/bracket';
import type { Match, Player, Tournament } from '../types';

type Tab = 'players' | 'pairings' | 'bracket';

/* Description de l'unique action que le tournoi attend à cet instant. */
interface Control {
  detail: string;
  action?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  accent?: string;
}

export function TournamentDetailPage({
  tournamentId,
  onBack,
  onViewStandings,
}: {
  tournamentId: string;
  onBack: () => void;
  onViewStandings: (id: string) => void;
}) {
  const { user } = useAuth();
  const {
    tournament,
    players,
    matches,
    loading,
    busy,
    error,
    load,
    startTournament,
    nextRound,
    startPlayoff,
    nextPlayoffRound,
    completeTournament,
    setMatchResult,
  } = useTournamentDetail(tournamentId);
  const [tab, setTab] = useState<Tab>('players');
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  if (loading || !tournament) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  /* Pool partagé : tout organisateur pilote n'importe quel tournoi ; les
     joueurs le consultent. L'API applique la même règle, ceci n'est que
     l'affichage. */
  const canEdit = user?.role === 'organizer';
  const hasPlayoff = tournament.format === 'swiss_playoff';
  const control = canEdit
    ? buildControl(tournament, players, matches, {
        startTournament,
        nextRound,
        startPlayoff,
        nextPlayoffRound,
        completeTournament,
      })
    : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ---------------------- Bandeau d'identité ---------------------- */}
      <header className="flex-none overflow-hidden rounded-2xl border bg-white dark:bg-gray-700 dark:bg-slate-600" style={{ borderColor: RULE }}>
        <div className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={onBack}
              className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors hover:border-gray-400"
              style={{ borderColor: RULE }}
              aria-label="Retour au tableau de bord"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <StatusTag status={tournament.status} />
                <span className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                  {hasPlayoff
                    ? `Poule ${tournament.total_rounds} rondes → finale à ${tournament.qualifiers}`
                    : `Système suisse · ${tournament.total_rounds} rondes`}
                </span>
              </div>
              <h1 className="truncate font-display text-2xl font-bold uppercase leading-tight tracking-[0.005em] xl:text-3xl">
                {tournament.name}
              </h1>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-gray-500">
                {tournament.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" style={{ color: GOLD }} />
                    {tournament.location}
                  </span>
                )}
                {tournament.start_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" style={{ color: GOLD }} />
                    {new Date(tournament.start_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" style={{ color: GOLD }} />
                  <span className="font-mono tabular">{players.length}</span> joueurs
                </span>
              </p>
            </div>
          </div>

          <PhaseChips tournament={tournament} />
        </div>

        {/* Barre de pilotage : le message et l'unique action attendue. */}
        <div className="flex flex-col gap-3 border-t bg-[#FBFAF9] px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 text-xs text-gray-600 dark:text-gray-50">
            {control?.detail ?? 'Consultation seule — vous n’êtes pas l’organisateur de ce tournoi.'}
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => onViewStandings(tournamentId)}
              className="focus-ring flex items-center gap-2 rounded-full border bg-white dark:bg-gray-700 px-3.5 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-gray-400"
              style={{ borderColor: RULE }}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Classement
            </button>

            {control?.action && (
              <button
                onClick={control.onClick}
                disabled={control.disabled || busy}
                className="focus-ring flex items-center gap-2 rounded-full px-4 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: control.accent ?? INK }}
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : control.icon}
                {control.action}
              </button>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mt-3 flex flex-none items-start gap-2 rounded-xl border px-4 py-2.5 text-sm"
          style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#B91C1C' }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* --------------------------- Onglets --------------------------- */}
      <nav className="mt-4 flex flex-none flex-wrap gap-1 border-b" style={{ borderColor: RULE }}>
        <TabLink active={tab === 'players'} onClick={() => setTab('players')} icon={<Users className="h-4 w-4" />} label="Joueurs" />
        <TabLink active={tab === 'pairings'} onClick={() => setTab('pairings')} icon={<ClipboardList className="h-4 w-4" />} label="Appariements" />
        <TabLink active={tab === 'bracket'} onClick={() => setTab('bracket')} icon={<GitBranch className="h-4 w-4" />} label="Arbre" />
      </nav>

      {/* Seul le panneau défile : la page, elle, tient dans l'écran. */}
      <div className="min-h-0 flex-1 overflow-auto py-4">
        {tab === 'players' && (
          <PlayersTab
            tournament={tournament}
            players={players}
            onChange={load}
            showAdd={showAddPlayer}
            setShowAdd={setShowAddPlayer}
          />
        )}

        {tab === 'pairings' && (
          <RoundsTab
            tournament={tournament}
            players={players}
            matches={matches}
            canEdit={canEdit}
            busy={busy}
            onSetResult={setMatchResult}
          />
        )}

        {/* L'arbre se dessine dès le début : prévisionnel tant que la poule
            tourne, puis réel dès le basculement en phase finale. */}
        {tab === 'bracket' && (
          <Bracket tournament={tournament} players={players} matches={matches} />
        )}

        {tournament.status === 'completed' && (
          <div className="mt-8">
            <Podium tournamentId={tournamentId} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Jalons compacts : où en est le tournoi, en une rangée.             */
/* ------------------------------------------------------------------ */
function PhaseChips({ tournament }: { tournament: Tournament }) {
  const hasPlayoff = tournament.format === 'swiss_playoff';

  const steps = [
    { key: 'registration', label: 'Inscriptions' },
    {
      key: 'qualifying',
      label:
        tournament.current_round > 0
          ? `Poule R${tournament.current_round}/${tournament.total_rounds}`
          : 'Poule qualificative',
    },
    ...(hasPlayoff
      ? [
          {
            key: 'playoff',
            label:
              tournament.playoff_round > 0
                ? roundLabel(tournament.qualifiers, tournament.playoff_round)
                : 'Phase finale',
          },
        ]
      : []),
    { key: 'completed', label: 'Terminé' },
  ];

  const currentKey =
    tournament.status === 'completed'
      ? 'completed'
      : tournament.status === 'registration'
        ? 'registration'
        : tournament.phase === 'playoff'
          ? 'playoff'
          : 'qualifying';
  const currentIndex = steps.findIndex((s) => s.key === currentKey);

  return (
    <ol className="flex shrink-0 flex-wrap items-center gap-1.5">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const live = i === currentIndex;

        return (
          <li key={step.key} className="flex items-center gap-1.5">
            {i > 0 && <span className="h-px w-3" style={{ backgroundColor: RULE }} />}
            <span
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1"
              style={{
                borderColor: live ? GOLD : RULE,
                backgroundColor: live ? `${GOLD}12` : done ? '#fff' : 'transparent',
              }}
            >
              <span
                className="flex h-4 w-4 items-center justify-center rounded font-mono text-[9px] font-semibold"
                style={{
                  backgroundColor: done ? INK : live ? GOLD : 'transparent',
                  border: done || live ? 'none' : `1px solid ${RULE}`,
                  color: done || live ? '#fff' : '#B0B0B6',
                }}
              >
                {i + 1}
              </span>
              <span
                className="font-display text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: done || live ? INK : '#B0B0B6' }}
              >
                {step.label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/*  Une seule action possible à la fois : celle que le tournoi attend.  */
/* ------------------------------------------------------------------ */
function buildControl(
  tournament: Tournament,
  players: Player[],
  matches: Match[],
  actions: {
    startTournament: () => void;
    nextRound: () => void;
    startPlayoff: () => void;
    nextPlayoffRound: () => void;
    completeTournament: () => void;
  }
): Control {
  const hasPlayoff = tournament.format === 'swiss_playoff';

  if (tournament.status === 'completed') {
    return { detail: 'Tournoi terminé — le palmarès est figé.' };
  }

  /* --- Inscriptions --- */
  if (tournament.status === 'registration') {
    const needed = hasPlayoff ? Math.max(2, tournament.qualifiers) : 2;
    const ready = players.length >= needed;
    return {
      detail: ready
        ? `${players.length} joueurs inscrits · prêt à lancer ${tournament.total_rounds} rondes au système suisse.`
        : `${players.length} joueur${players.length > 1 ? 's' : ''} inscrit${players.length > 1 ? 's' : ''} · il en faut ${needed} pour ce format.`,
      action: 'Lancer la poule',
      icon: <Flag className="h-3.5 w-3.5" />,
      disabled: !ready,
      onClick: actions.startTournament,
    };
  }

  /* --- Poule qualificative --- */
  if (tournament.phase === 'qualifying') {
    const roundMatches = matches.filter((m) => m.phase !== 'playoff' && m.round === tournament.current_round);
    const pending = roundMatches.filter((m) => m.result === 'pending').length;
    const isLastRound = tournament.current_round >= tournament.total_rounds;

    if (pending > 0) {
      return {
        detail: `Ronde ${tournament.current_round} en cours · ${pending} résultat${pending > 1 ? 's' : ''} à saisir sur ${roundMatches.length} parties.`,
      };
    }

    if (!isLastRound) {
      return {
        detail: `Ronde ${tournament.current_round} terminée · les appariements suivants seront calculés selon les scores.`,
        action: 'Ronde suivante',
        icon: <ArrowRight className="h-3.5 w-3.5" />,
        onClick: actions.nextRound,
      };
    }

    if (hasPlayoff) {
      return {
        detail: `Poule terminée · les ${tournament.qualifiers} premiers du classement entrent en phase finale.`,
        action: 'Lancer la phase finale',
        icon: <Trophy className="h-3.5 w-3.5" />,
        onClick: actions.startPlayoff,
        accent: GOLD,
      };
    }

    return {
      detail: 'Dernière ronde terminée · le classement final est établi.',
      action: 'Terminer',
      icon: <Trophy className="h-3.5 w-3.5" />,
      onClick: actions.completeTournament,
      accent: GREEN,
    };
  }

  /* --- Phase finale --- */
  const current = matches.filter((m) => m.phase === 'playoff' && m.round === tournament.playoff_round);
  const undecided = current.filter((m) => matchWinnerId(m) === null).length;
  const isFinal = tournament.playoff_round >= bracketRounds(tournament.qualifiers);
  const label = roundLabel(tournament.qualifiers, tournament.playoff_round);

  if (undecided > 0) {
    return {
      detail: `${label} · ${undecided} rencontre${undecided > 1 ? 's' : ''} sans vainqueur. Une nulle se départage au blitz.`,
    };
  }

  if (!isFinal) {
    return {
      detail: `${label} · vainqueurs connus, les qualifiés s’affrontent au tour suivant.`,
      action: 'Tour suivant',
      icon: <ArrowRight className="h-3.5 w-3.5" />,
      onClick: actions.nextPlayoffRound,
      accent: GOLD,
    };
  }

  return {
    detail: 'Finale jouée · le vainqueur du tournoi est désigné.',
    action: 'Terminer',
    icon: <Trophy className="h-3.5 w-3.5" />,
    onClick: actions.completeTournament,
    accent: GREEN,
  };
}

function TabLink({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring relative flex items-center gap-2 px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.1em] transition-colors ${
        active ? 'text-[#111114] dark:text-[#F5F4F8]' : 'text-[#9A9AA0] dark:text-[#6B6B75]'
      }`}
    >
      {icon}
      {label}
      {active && <span className="absolute inset-x-2 bottom-0 h-0.5" style={{ backgroundColor: GOLD }} />}
    </button>
  );
}
