import { useState } from 'react';
import { Plus, Calendar, MapPin, ArrowRight, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { OrganizerTeam } from '../components/OrganizerTeam';
import {
  DataBar,
  SectionHead,
  RoundRuler,
  StatusTag,
  CheckerEdge,
  INK,
  GOLD,
  GREEN,
  RULE,
} from '../components/Scoreboard';
import { useAuth } from '../hooks/useAuth';
import { useOrganizerBoard, type TournamentDesk } from '../hooks/useOrganizerBoard';
import { api } from '../lib/api';

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date à définir';

/* Même code couleur que les pastilles d'état, repris sur le bord
   d'échiquier de chaque bloc. */
const STATUS_ACCENT: Record<TournamentDesk['tournament']['status'], string> = {
  registration: GREEN,
  in_progress: GOLD,
  completed: '#8A8A90',
};

export function OrganizerDashboard({
  onHome,
  onNewTournament,
  onOpenTournament,
  theme, 
  onToggleTheme,
}: {
  onHome: () => void;
  onNewTournament: () => void;
  onOpenTournament: (id: string) => void;
  theme: 'dark' | 'light'; 
  onToggleTheme: () => void
}) {
  const { user } = useAuth();
  const { desks, loading, error, reload } = useOrganizerBoard();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const totalPlayers = desks.reduce((sum, d) => sum + d.players, 0);
  const live = desks.filter((d) => d.tournament.status === 'in_progress').length;

  const remove = async (desk: TournamentDesk) => {
    setDeletingId(desk.tournament.id);
    setActionError(null);
    try {
      const gone = await api.tournaments.delete(desk.tournament.id);
      setNotice(
        `« ${desk.tournament.name} » supprimé, avec ${gone.players} joueur${gone.players > 1 ? 's' : ''} ` +
          `et ${gone.matches} partie${gone.matches > 1 ? 's' : ''}.`
      );
      setConfirmingId(null);
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Suppression impossible.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell wide onHome={onHome} theme={theme} onToggleTheme={onToggleTheme}>
      <DataBar
        role="Organisateur"
        name={user?.full_name ?? ''}
        detail={user?.organization}
        accent={GOLD}
        metrics={[
          { value: desks.length, label: 'Tournois' },
          { value: live, label: 'En cours' },
          { value: totalPlayers, label: 'Joueurs' },
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

      {notice && (
        <div
          className="mb-6 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: RULE, backgroundColor: '#fff' }}
        >
          <span>{notice}</span>
          <button
            onClick={() => setNotice(null)}
            className="focus-ring font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 hover:text-gray-700"
          >
            Fermer
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-40 rounded-2xl" />
        </div>
      ) : (
        /* Console de gestion : colonne de travail large, panneau latéral
           pour l'équipe. En dessous de 1280px tout revient en pile. */
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] 2xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="min-w-0">
            <section>
              {/* L'action de création vit au-dessus de la liste qu'elle
                  alimente, comme « Ajouter » au-dessus de l'équipe. */}
              <SectionHead
                title="Mes tournois"
                count={desks.length}
                action={
                  <button
                    onClick={onNewTournament}
                    className="focus-ring flex items-center gap-2 rounded-full border bg-white dark:bg-gray-700 px-3.5 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-gray-400"
                    style={{ borderColor: RULE }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nouveau tournoi
                  </button>
                }
              />
              {desks.length === 0 ? (
                <div
                  className="rounded-2xl border border-dashed px-6 py-14 text-center"
                  style={{ borderColor: RULE }}
                >
                  <p className="font-display text-xl font-bold uppercase">Aucun tournoi</p>
                  <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-500">
                    Votre première compétition apparaîtra ici. Les joueurs pourront s’y inscrire depuis
                    leur espace.
                  </p>
                  <button
                    onClick={onNewTournament}
                    className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85"
                    style={{ backgroundColor: INK }}
                  >
                    <Plus className="h-4 w-4" />
                    Créer un tournoi
                  </button>
                </div>
              ) : (
                /* Grille de blocs alignés. Au-delà de quatre tournois la
                   zone défile plutôt que d'allonger la page, pour garder
                   la file de tâches et le panneau équipe sous les yeux. */
                <div
                  className="max-h-[34rem] overflow-y-auto pr-1"
                  tabIndex={0}
                  role="region"
                  aria-label="Liste de vos tournois"
                >
                  <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {desks.map((desk) => (
                      <DeskCard
                        key={desk.tournament.id}
                        desk={desk}
                        confirming={confirmingId === desk.tournament.id}
                        deleting={deletingId === desk.tournament.id}
                        onOpen={() => onOpenTournament(desk.tournament.id)}
                        onAskDelete={() => {
                          setConfirmingId(desk.tournament.id);
                          setActionError(null);
                        }}
                        onCancelDelete={() => setConfirmingId(null)}
                        onConfirmDelete={() => remove(desk)}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>

          <aside className="min-w-0">
            <OrganizerTeam />
          </aside>
        </div>
      )}
    </AppShell>
  );
}

/* Bloc tournoi. Hauteur uniforme dans la grille grâce au flex vertical :
   le pied de carte est repoussé par mt-auto, donc les boutons s'alignent
   d'une carte à l'autre quelle que soit la longueur du titre. */
function DeskCard({
  desk,
  confirming,
  deleting,
  onOpen,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  desk: TournamentDesk;
  confirming: boolean;
  deleting: boolean;
  onOpen: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const { tournament, players } = desk;
  const accent = STATUS_ACCENT[tournament.status];

  return (
    <li
      className="flex flex-col overflow-hidden rounded-2xl border bg-white dark:bg-gray-700"
      style={{ borderColor: RULE }}
    >
      {/* Le bord d'échiquier reprend le motif du bandeau d'identité,
          teinté par l'état du tournoi. */}
      <CheckerEdge accent={accent} squares={20} />

      {confirming ? (
        <div className="flex flex-1 flex-col p-5">
          <p className="font-display text-lg font-bold uppercase leading-tight">
            Supprimer « {tournament.name} » ?
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {players} joueur{players > 1 ? 's' : ''} et toutes les parties du tournoi seront effacés.
            Cette action est définitive.
          </p>
          <div className="mt-auto flex gap-2 pt-5">
            <button
              onClick={onCancelDelete}
              className="focus-ring flex-1 rounded-full border px-4 py-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-gray-400"
              style={{ borderColor: RULE }}
            >
              Annuler
            </button>
            <button
              onClick={onConfirmDelete}
              disabled={deleting}
              className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
              style={{ backgroundColor: '#B91C1C' }}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col p-5">
          <StatusTag status={tournament.status} />

          <h3 className="mt-1.5 font-display text-xl font-bold uppercase leading-tight">
            {tournament.name}
          </h3>

          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
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
          </p>

          <div className="mt-4">
            <RoundRuler total={tournament.total_rounds} current={tournament.current_round} />
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              <p className="font-mono text-2xl font-semibold leading-none tabular">
                {String(players).padStart(2, '0')}
              </p>
              <p className="mt-1 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                Joueurs
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onAskDelete}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border text-gray-400 transition-colors hover:border-red-300 hover:text-red-600"
                style={{ borderColor: RULE }}
                aria-label={`Supprimer ${tournament.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                onClick={onOpen}
                className="focus-ring flex items-center gap-2 rounded-full px-4 py-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85"
                style={{ backgroundColor: INK }}
              >
                Gérer
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
