import { useState } from 'react';
import { Calendar, MapPin, ArrowRight, Loader2, AlertCircle, Plus } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import {
  DataBar,
  SectionHead,
  ScoreStrip,
  StatusTag,
  INK,
  GOLD,
  PURPLE,
  RULE,
} from '../components/Scoreboard';
import { useAuth } from '../hooks/useAuth';
import { usePlayerBoard, type NextGame, type TournamentBoard } from '../hooks/usePlayerBoard';
import { api } from '../lib/api';
import type { Tournament } from '../types';
import type { NavItem } from '../components/landing/tokens';

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date à définir';

/* Les scores s'écrivent 3½ et non 3.5 : c'est la notation des feuilles
   de tournoi, et le glyphe est le même que dans la ligne de forme. */
const formatPoints = (points: number) => {
  const whole = Math.floor(points);
  const half = points - whole >= 0.5;
  if (half) return `${whole || ''}½`;
  return String(whole);
};

export function PlayerDashboard({
  onHome,
  onNav,
  onOpenTournament,
  theme,
  onToggleTheme,
}: {
  onHome: () => void;
  onNav?: (item: NavItem) => void;
  onOpenTournament: (id: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void
}) {
  const { user } = useAuth();
  const { boards, open, next, loading, error, reload } = usePlayerBoard();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const totalPoints = boards.reduce((sum, b) => sum + (b.registration.points ?? 0), 0);
  const playedGames = boards.reduce((sum, b) => sum + b.games.length, 0);

  const act = async (id: string, action: 'join' | 'leave') => {
    setBusyId(id);
    setActionError(null);
    try {
      if (action === 'join') await api.registrations.join(id);
      else await api.registrations.leave(id);
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action impossible.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppShell onHome={onHome} onNav={onNav} onDashboard={() => {}} theme={theme} onToggleTheme={onToggleTheme}>
      <DataBar
        role="Joueur"
        name={user?.full_name ?? ''}
        detail={user?.club}
        accent={PURPLE}
        metrics={[
          { value: formatPoints(totalPoints), label: 'Points' },
          { value: playedGames, label: 'Parties' },
          { value: boards.length, label: 'Tournois' },
        ]}
      />

      {(error || actionError) && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#B91C1C' }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error ?? actionError}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-44 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
      ) : (
        <>
          <NextGameCard game={next} onOpen={onOpenTournament} />

          <section className="mt-10">
            <SectionHead title="Mes tournois" count={boards.length} />
            {boards.length === 0 ? (
              <Empty
                title="Vous n’êtes inscrit à aucun tournoi"
                text="Choisissez une compétition ouverte ci-dessous pour entrer en lice."
              />
            ) : (
              <ul className="overflow-hidden rounded-2xl border bg-white dark:bg-gray-700" style={{ borderColor: RULE }}>
                {boards.map((board, i) => (
                  <TournamentRow
                    key={board.registration.id}
                    board={board}
                    first={i === 0}
                    busy={busyId === board.registration.tournament_id}
                    onOpen={() => onOpenTournament(board.registration.tournament_id)}
                    onLeave={() => act(board.registration.tournament_id, 'leave')}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10">
            <SectionHead title="Tournois ouverts" count={open.length} />
            {open.length === 0 ? (
              <Empty
                title="Aucune inscription ouverte"
                text="Les prochaines compétitions apparaîtront ici dès leur publication."
              />
            ) : (
              <ul className="overflow-hidden rounded-2xl border bg-white dark:bg-gray-700" style={{ borderColor: RULE }}>
                {open.map((tournament, i) => (
                  <OpenRow
                    key={tournament.id}
                    tournament={tournament}
                    first={i === 0}
                    busy={busyId === tournament.id}
                    onJoin={() => act(tournament.id, 'join')}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/*  La thèse de la page : la prochaine partie.                         */
/*  La carte prend la couleur des pièces attribuées — un joueur         */
/*  d'échecs sait ce qu'il joue avant d'avoir lu une ligne.            */
/* ------------------------------------------------------------------ */
function NextGameCard({ game, onOpen }: { game: NextGame | null; onOpen: (id: string) => void }) {
  if (!game) {
    return (
      <div
        className="flex items-center justify-between gap-6 rounded-2xl border border-dashed px-6 py-8"
        style={{ borderColor: RULE }}
      >
        <div>
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Prochaine partie
          </p>
          <p className="mt-2 font-display text-2xl font-bold uppercase">Aucun appariement en attente</p>
          <p className="mt-1 text-sm text-gray-500">
            Votre prochain adversaire s’affichera ici dès que l’arbitre aura publié la ronde.
          </p>
        </div>
      </div>
    );
  }

  const black = game.color === 'black';
  const bg = black ? INK : '#fff';
  const fg = black ? '#fff' : INK;
  const muted = black ? 'rgba(255,255,255,0.55)' : '#6B7280';
  const hairline = black ? 'rgba(255,255,255,0.16)' : RULE;

  return (
    <article
      className="overflow-hidden rounded-2xl border"
      style={{ backgroundColor: bg, color: fg, borderColor: black ? INK : RULE }}
    >
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="min-w-0">
          <p
            className="font-display text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: GOLD }}
          >
            Prochaine partie · {game.tournament.name}
          </p>

          <p className="mt-3 font-display text-4xl font-bold uppercase leading-none sm:text-5xl">
            {game.opponent ? game.opponent.name : 'Exempt'}
          </p>

          <p className="mt-2 text-sm" style={{ color: muted }}>
            {game.opponent
              ? [game.opponent.club, game.opponent.rating ? `Elo ${game.opponent.rating}` : null]
                  .filter(Boolean)
                  .join(' · ') || 'Adversaire non classé'
              : 'Vous ne jouez pas cette ronde et marquez le point.'}
          </p>

          {/* L'attribution des couleurs, dite en clair. */}
          <p className="mt-5 inline-flex items-center gap-2.5 font-display text-sm font-semibold uppercase tracking-[0.14em]">
            <span
              className="h-4 w-4 rounded-full border"
              style={{
                backgroundColor: black ? INK : '#fff',
                borderColor: black ? 'rgba(255,255,255,0.7)' : INK,
              }}
            />
            Vous avez les {black ? 'noirs' : 'blancs'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-6 sm:flex-col sm:items-end sm:gap-4">
          <div className="flex gap-6 sm:gap-5">
            <Figure label="Ronde" value={game.round} color={muted} />
            <Figure label="Échiquier" value={game.board} color={muted} />
          </div>
          <button
            onClick={() => onOpen(game.tournament.id)}
            className="focus-ring flex items-center gap-2 rounded-full px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-85"
            style={{ backgroundColor: black ? '#fff' : INK, color: black ? INK : '#fff' }}
          >
            Voir la ronde
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-px" style={{ backgroundColor: hairline }} />
    </article>
  );
}

function Figure({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-right">
      <p className="font-mono text-3xl font-semibold leading-none tabular">{value}</p>
      <p
        className="mt-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.16em]"
        style={{ color }}
      >
        {label}
      </p>
    </div>
  );
}

function TournamentRow({
  board,
  first,
  busy,
  onOpen,
  onLeave,
}: {
  board: TournamentBoard;
  first: boolean;
  busy: boolean;
  onOpen: () => void;
  onLeave: () => void;
}) {
  const tournament = board.registration.tournament;
  const canLeave = tournament?.status === 'registration';

  return (
    <li className={first ? '' : 'border-t'} style={first ? undefined : { borderColor: RULE }}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="min-w-0 flex-1">
          {tournament && <StatusTag status={tournament.status} />}
          <h3 className="mt-1.5 truncate font-display text-xl font-bold uppercase leading-tight">
            {tournament?.name ?? 'Tournoi supprimé'}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" style={{ color: GOLD }} />
              {formatDate(tournament?.start_date ?? null)}
            </span>
            {tournament?.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" style={{ color: GOLD }} />
                {tournament.location}
              </span>
            )}
          </p>
        </div>

        <div className="sm:w-56">
          <ScoreStrip games={board.games} />
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right">
            <p className="font-mono text-2xl font-semibold leading-none tabular">
              {formatPoints(board.registration.points ?? 0)}
            </p>
            <p className="mt-1 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              Points
            </p>
          </div>

          <button
            onClick={onOpen}
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-gray-400"
            style={{ borderColor: RULE }}
            aria-label={`Ouvrir ${tournament?.name ?? 'le tournoi'}`}
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          {canLeave && (
            <button
              onClick={onLeave}
              disabled={busy}
              className="focus-ring font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 transition-colors hover:text-red-600 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Se retirer'}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function OpenRow({
  tournament,
  first,
  busy,
  onJoin,
}: {
  tournament: Tournament;
  first: boolean;
  busy: boolean;
  onJoin: () => void;
}) {
  return (
    <li className={first ? '' : 'border-t'} style={first ? undefined : { borderColor: RULE }}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold uppercase leading-tight">
            {tournament.name}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" style={{ color: GOLD }} />
              {formatDate(tournament.start_date)}
            </span>
            {tournament.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" style={{ color: GOLD }} />
                {tournament.location}
              </span>
            )}
            <span className="font-mono tabular">{tournament.total_rounds} rondes</span>
          </p>
        </div>

        <button
          onClick={onJoin}
          disabled={busy}
          className="focus-ring flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
          style={{ backgroundColor: PURPLE }}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          S’inscrire
        </button>
      </div>
    </li>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div
      className="rounded-2xl border border-dashed px-6 py-12 text-center"
      style={{ borderColor: RULE }}
    >
      <p className="font-display text-lg font-bold uppercase">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-500">{text}</p>
    </div>
  );
}
