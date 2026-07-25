import { useState } from 'react';
import { UserPlus, Trash2, X, Loader2, AlertCircle, Upload } from 'lucide-react';
import { api } from '../lib/api';
import { qualifyingStandings } from '../lib/bracket';
import { SectionHead, INK, GOLD, RULE } from './Scoreboard';
import { ImportPlayersModal } from './ImportPlayersModal';
import type { Player, Tournament } from '../types';

const formatPoints = (points: number) => {
  const whole = Math.floor(points);
  return points - whole >= 0.5 ? `${whole || ''}½` : String(whole);
};

/* La liste des joueurs sert deux usages : gérer la composition avant le
   coup d'envoi, et lire le classement une fois la poule lancée. On passe
   donc de l'ordre d'inscription à l'ordre du classement dès la ronde 1. */
export function PlayersTab({
  tournament,
  players,
  onChange,
  showAdd,
  setShowAdd,
}: {
  tournament: Tournament;
  players: Player[];
  onChange: () => void;
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
}) {
  const canEdit = tournament.status === 'registration';
  const started = tournament.current_round > 0;
  const ranked = started ? qualifyingStandings(players) : players;
  const cut = tournament.format === 'swiss_playoff' ? tournament.qualifiers : 0;
  const [showImport, setShowImport] = useState(false);

  return (
    <div>
      {showImport && (
        <ImportPlayersModal
          tournamentId={tournament.id}
          onClose={() => setShowImport(false)}
          onImported={() => { setShowImport(false); onChange(); }}
        />
      )}
      <SectionHead
        title={started ? 'Classement de la poule' : 'Joueurs inscrits'}
        count={players.length}
        action={
          canEdit && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImport(true)}
                className="focus-ring flex items-center gap-2 rounded-full border bg-white dark:bg-gray-700 px-4 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-gray-400"
                style={{ borderColor: RULE }}
              >
                <Upload className="h-3.5 w-3.5" />
                Importer
              </button>
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="focus-ring flex items-center gap-2 rounded-full border bg-white dark:bg-gray-700 px-4 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-gray-400"
                style={{ borderColor: RULE }}
              >
                {showAdd ? <X className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                {showAdd ? 'Annuler' : 'Inscrire un joueur'}
              </button>
            </div>
          )
        }
      />

      {showAdd && canEdit && (
        <AddPlayerForm
          tournamentId={tournament.id}
          seed={players.length + 1}
          onDone={() => {
            setShowAdd(false);
            onChange();
          }}
        />
      )}

      {players.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-400 dark:border-gray-600 px-6 py-14 text-center">
          <p className="font-display text-lg font-bold uppercase">Aucun joueur inscrit</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-500">
            {canEdit
              ? 'Inscrivez les participants : la poule ne peut pas démarrer sans eux.'
              : 'La liste des participants est close.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white dark:bg-[#1e1535]" style={{ borderColor: RULE }}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <Th className="w-12 text-center">{started ? 'Rg' : '#'}</Th>
                <Th className="text-left">Joueur</Th>
                <Th className="hidden text-left sm:table-cell">Club</Th>
                <Th className="w-20 text-right">Elo</Th>
                {started && <Th className="w-16 text-right">Pts</Th>}
                {canEdit && <Th className="w-12" />}
              </tr>
            </thead>
            <tbody>
              {ranked.map((player, i) => {
                const position = i + 1;
                const qualified = started && cut > 0 && position <= cut;
                const isCutLine = started && cut > 0 && position === cut;

                return (
                  <tr
                    key={player.id}
                    className={i % 2 === 1 ? 'bg-[#FBFAF9] dark:bg-[#261d3e]' : 'bg-white dark:bg-[#1e1535]'}
                    style={{ borderBottom: isCutLine ? `2px solid ${GOLD}` : `1px solid ${RULE}` }}
                  >
                    <td className="px-3 py-3 text-center">
                      <span
                        className="font-mono text-xs font-semibold tabular"
                        style={{ color: qualified ? GOLD : '#9A9AA0' }}
                      >
                        {position}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-800 dark:text-gray-100">{player.name}</p>
                      {player.club && <p className="text-xs text-gray-400 dark:text-gray-500 sm:hidden">{player.club}</p>}
                    </td>
                    <td className="hidden px-3 py-3 text-gray-500 dark:text-gray-400 sm:table-cell">{player.club || '—'}</td>
                    <td className="px-3 py-3 text-right font-mono text-gray-500 dark:text-gray-400 tabular">
                      {player.rating || '—'}
                    </td>
                    {started && (
                      <td className="px-3 py-3 text-right font-mono text-base font-semibold tabular text-gray-800 dark:text-gray-100">
                        {formatPoints(player.points ?? 0)}
                      </td>
                    )}
                    {canEdit && (
                      <td className="px-3 py-3 text-right">
                        <DeletePlayerButton playerId={player.id} name={player.name} onDeleted={onChange} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {started && cut > 0 && (
            <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderTop: `1px solid ${RULE}` }}>
              <span className="h-0.5 w-6" style={{ backgroundColor: GOLD }} />
              <p className="text-xs text-gray-500">
                Les <strong>{cut}</strong> premiers seront qualifiés pour la phase finale.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddPlayerForm({
  tournamentId,
  seed,
  onDone,
}: {
  tournamentId: string;
  seed: number;
  onDone: () => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', club: '', rating: 1200 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.players.create({
        tournament_id: tournamentId,
        name: form.name.trim(),
        email: form.email.trim() || null,
        club: form.club.trim() || null,
        rating: form.rating || 0,
        seed_number: seed,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inscription impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-5 rounded-2xl border bg-white dark:bg-gray-700 p-5" style={{ borderColor: RULE }}>
      <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
        Nouveau joueur — dossard <span className="font-mono">{seed}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" required>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
            placeholder="Camille Rousset"
          />
        </Field>
        <Field label="Club">
          <input
            value={form.club}
            onChange={(e) => setForm({ ...form, club: e.target.value })}
            className={inputCls}
            placeholder="Échiquier de Lyon"
          />
        </Field>
        <Field label="Adresse e-mail">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
            placeholder="joueur@exemple.com"
          />
        </Field>
        <Field label="Classement Elo">
          <input
            type="number"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) || 0 })}
            className={inputCls}
          />
        </Field>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#B91C1C' }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="focus-ring flex items-center gap-2 rounded-full px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
          style={{ backgroundColor: INK }}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Inscription…' : 'Inscrire le joueur'}
        </button>
      </div>
    </form>
  );
}

function DeletePlayerButton({
  playerId,
  name,
  onDeleted,
}: {
  playerId: string;
  name: string;
  onDeleted: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="focus-ring rounded-lg p-1.5 text-gray-300 transition-colors hover:text-red-600"
        aria-label={`Retirer ${name}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        onClick={async () => {
          setBusy(true);
          await api.players.delete(playerId);
          onDeleted();
        }}
        disabled={busy}
        className="focus-ring rounded-full px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-white disabled:opacity-60"
        style={{ backgroundColor: '#B91C1C' }}
      >
        {busy ? '…' : 'Retirer'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="focus-ring rounded-lg p-1 text-gray-400 hover:text-gray-700"
        aria-label="Annuler"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
        {label}
        {required && <span style={{ color: GOLD }}> *</span>}
      </span>
      {children}
    </label>
  );
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-3 py-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 ${className}`}
      style={{ borderBottom: `1px solid ${RULE}` }}
    >
      {children}
    </th>
  );
}
