import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { BackButton, Field, PageWrapper, inputCls } from '../components/ui';

export function TournamentCreatePage({ onBack, onCreated }: { onBack: () => void; onCreated: (id: string) => void }) {
  const [form, setForm] = useState({ name: '', location: '', description: '', start_date: '', total_rounds: 5 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) { setError('Le nom du tournoi est requis.'); return; }
    setSaving(true); setError(null);
    try {
      const data = await api.tournaments.create({
        name: form.name.trim(),
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        start_date: form.start_date || null,
        total_rounds: Number(form.total_rounds),
      });
      onCreated(data.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper>
      <BackButton onClick={onBack} />

      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-400">Nouveau tournoi</h2>
        <p className="mt-1.5 text-slate-400">Configurez votre événement en quelques secondes.</p>
      </div>

      <div className="max-w-2xl">
        <div className="glass gradient-border rounded-2xl p-6 space-y-5">

          <Field label="Nom du tournoi" required>
            <input value={form.name} onChange={set('name')} placeholder="Open d'Hiver 2026" className={inputCls} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Lieu">
              <input value={form.location} onChange={set('location')} placeholder="Cercle d'échecs, Paris" className={inputCls} />
            </Field>
            <Field label="Date de début">
              <input type="date" value={form.start_date} onChange={set('start_date')} className={inputCls} />
            </Field>
          </div>

          <Field label="Nombre de rondes">
            <div className="flex items-center gap-3">
              <input
                type="number" min={1} max={20}
                value={form.total_rounds}
                onChange={(e) => setForm((f) => ({ ...f, total_rounds: Number(e.target.value) || 1 }))}
                className={`w-20 ${inputCls} text-center`}
                placeholder="…"
              />
            </div>
          </Field>

          <Field label="Description">
            <textarea
              value={form.description} onChange={set('description')} rows={3}
              placeholder="Cadence de jeu, arbitres, prix…"
              className={`${inputCls} resize-none`}
            />
          </Field>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onBack} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
              Annuler
            </button>
            <button
              onClick={submit} disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className="h-4 w-4" />
              {saving ? 'Création…' : 'Créer le tournoi'}
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
