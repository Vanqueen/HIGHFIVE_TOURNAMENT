import { useState } from 'react';
import { Plus, Check, X, Trash2, UserPlus } from 'lucide-react';
import { api } from '../lib/api';
import { Field, inputCls } from './ui';
import type { Player, Tournament } from '../types';

export function PlayersTab({ tournament, players, onChange, showAdd, setShowAdd }: {
  tournament: Tournament;
  players: Player[];
  onChange: () => void;
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
}) {
  const canEdit = tournament.status === 'registration';

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-400">Joueurs inscrits</h3>
          <p className="text-xs text-slate-500 mt-0.5">{players.length} participant{players.length !== 1 ? 's' : ''}</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3.5 py-2 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/20 hover:border-violet-500/50"
          >
            <UserPlus className="h-4 w-4" /> Ajouter
          </button>
        )}
      </div>

      {showAdd && (
        <AddPlayerForm
          tournamentId={tournament.id}
          seed={players.length + 1}
          onDone={() => { setShowAdd(false); onChange(); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {players.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/60">
            <UserPlus className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-sm text-slate-500">Aucun joueur inscrit.</p>
          {canEdit && <p className="mt-1 text-xs text-slate-600">Ajoutez votre premier participant.</p>}
        </div>
      ) : (
        <div className="glass gradient-border overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">#</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Joueur</th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:table-cell">Club</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Elo</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Pts</th>
                {canEdit && <th className="px-5 py-3.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {players.map((p, i) => (
                <tr key={p.id} className="transition-colors hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-mono text-xs text-slate-600">{i + 1}</td>
                  <td className="px-5 py-4 font-medium text-slate-300">{p.name}</td>
                  <td className="hidden px-5 py-4 text-slate-500 sm:table-cell">{p.club || '—'}</td>
                  <td className="px-5 py-4 font-mono text-slate-400">{p.rating}</td>
                  <td className="px-5 py-4 text-right font-mono font-semibold text-slate-300">{Number(p.points).toFixed(1)}</td>
                  {canEdit && (
                    <td className="px-5 py-4 text-right">
                      <DeletePlayerButton playerId={p.id} onDeleted={onChange} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AddPlayerForm({ tournamentId, seed, onDone, onCancel }: { tournamentId: string; seed: number; onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', club: '', rating: 1200 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!form.name.trim()) { setError('Le nom est requis.'); return; }
    setSaving(true); setError(null);
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-violet-500/15 bg-violet-500/5 p-5">
      <p className="mb-4 text-sm font-medium text-violet-300">Nouveau joueur — #{seed}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" required>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Magnus Carlsen" />
        </Field>
        <Field label="Club">
          <input value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} className={inputCls} placeholder="Cercle d'échecs" />
        </Field>
        <Field label="Email">
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="joueur@echecs.fr" />
        </Field>
        <Field label="Classement Elo">
          <input type="number" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) || 0 })} className={inputCls} />
        </Field>
      </div>
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      <div className="mt-4 flex justify-end gap-3">
        <button onClick={onCancel} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
          Annuler
        </button>
        <button onClick={submit} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all">
          <Plus className="h-3.5 w-3.5" />
          {saving ? 'Ajout…' : 'Inscrire'}
        </button>
      </div>
    </div>
  );
}

function DeletePlayerButton({ playerId, onDeleted }: { playerId: string; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState(false);
  if (!confirm) return (
    <button onClick={() => setConfirm(true)} className="rounded-lg p-1.5 text-slate-600 transition-colors hover:text-red-400 hover:bg-red-500/10">
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
  return (
    <div className="flex items-center gap-2 justify-end">
      <span className="text-xs text-slate-500">Confirmer ?</span>
      <button onClick={async () => { await api.players.delete(playerId); onDeleted(); }} className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 transition-colors">
        <Check className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => setConfirm(false)} className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
