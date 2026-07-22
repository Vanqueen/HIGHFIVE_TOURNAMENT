import { useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Check } from 'lucide-react';
import { api } from '../lib/api';
import { BRACKET_SIZES, roundLabel } from '../lib/bracket';
import { CheckerEdge, INK, GOLD, RULE } from '../components/Scoreboard';
import type { TournamentFormat } from '../types';

const FORMATS: { value: TournamentFormat; title: string; blurb: string }[] = [
  {
    value: 'swiss',
    title: 'Poule suisse',
    blurb:
      'Une poule unique : tout le monde joue chaque ronde, les appariements suivent les scores. Le classement final fait le vainqueur.',
  },
  {
    value: 'swiss_playoff',
    title: 'Poule suisse + phase finale',
    blurb:
      'La même poule sert de qualification, puis les mieux classés s’affrontent en élimination directe jusqu’au titre.',
  },
];

export function TournamentCreatePage({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: (id: string) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    start_date: '',
    total_rounds: 5,
    format: 'swiss_playoff' as TournamentFormat,
    qualifiers: 4,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) {
      setError('Le nom du tournoi est requis.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const data = await api.tournaments.create({
        name: form.name.trim(),
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        start_date: form.start_date || null,
        total_rounds: Number(form.total_rounds),
        format: form.format,
        qualifiers: form.format === 'swiss_playoff' ? Number(form.qualifiers) : 0,
      });
      onCreated(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible.');
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={onBack}
        className="focus-ring group mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Retour
      </button>

      <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-[0.005em] sm:text-4xl">
        Nouveau tournoi
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Le format se choisit maintenant et ne changera plus une fois la poule lancée.
      </p>

      <div className="mt-7 overflow-hidden rounded-2xl border bg-white" style={{ borderColor: RULE }}>
        <div className="space-y-6 p-6">
          <Field label="Nom du tournoi" required>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="Open d’hiver 2026"
              className={inputCls}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Lieu">
              <input
                value={form.location}
                onChange={set('location')}
                placeholder="Cercle d’échecs, Lyon"
                className={inputCls}
              />
            </Field>
            <Field label="Date de début">
              <input type="date" value={form.start_date} onChange={set('start_date')} className={inputCls} />
            </Field>
          </div>

          {/* ------------------------- Format ------------------------- */}
          <Field label="Format" required>
            <div className="grid gap-3 sm:grid-cols-2">
              {FORMATS.map((option) => {
                const active = form.format === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, format: option.value }))}
                    aria-pressed={active}
                    className="focus-ring rounded-xl border p-4 text-left transition-all"
                    style={{
                      borderColor: active ? INK : RULE,
                      boxShadow: active ? `0 0 0 1px ${INK}` : 'none',
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                        style={{
                          borderColor: active ? INK : '#C9C9CE',
                          backgroundColor: active ? INK : 'transparent',
                        }}
                      >
                        {active && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                      </span>
                      <span className="font-display text-sm font-bold uppercase tracking-[0.08em]">
                        {option.title}
                      </span>
                    </span>
                    <span className="mt-2 block text-[11px] leading-snug text-gray-500">{option.blurb}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Rondes de la poule" required>
              {/* Raccourcis pour les cadences courantes, plus la saisie
                  libre : un open peut se jouer en 4, 6 ou 11 rondes. */}
              <div className="flex gap-2">
                <SegmentedNumber
                  className="flex-1"
                  options={[3, 5, 7, 9]}
                  value={form.total_rounds}
                  onChange={(n) => setForm((f) => ({ ...f, total_rounds: n }))}
                />
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.total_rounds}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      total_rounds: Math.min(20, Math.max(1, Number(e.target.value) || 1)),
                    }))
                  }
                  aria-label="Nombre de rondes"
                  className="w-20 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-center font-mono text-sm font-semibold tabular outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                De 1 à 20 rondes. En système suisse, on compte en général une ronde par tranche de
                deux joueurs environ.
              </p>
            </Field>

            {form.format === 'swiss_playoff' && (
              <Field label="Qualifiés pour la phase finale" required>
                <SegmentedNumber
                  options={[...BRACKET_SIZES].filter((n) => n <= 16)}
                  value={form.qualifiers}
                  onChange={(n) => setForm((f) => ({ ...f, qualifiers: n }))}
                />
                <p className="mt-2 text-[11px] text-gray-500">
                  {form.qualifiers} qualifiés · la phase finale démarre en{' '}
                  <strong>{roundLabel(form.qualifiers, 1).toLowerCase()}</strong>. Il faudra donc au moins{' '}
                  {form.qualifiers} joueurs inscrits.
                </p>
              </Field>
            )}
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="Cadence de jeu, arbitrage, prix…"
              className={`${inputCls} resize-none`}
            />
          </Field>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border px-4 py-3 text-sm"
              style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#B91C1C' }}
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onBack}
              className="focus-ring rounded-full px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 transition-colors hover:text-gray-900"
            >
              Annuler
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="focus-ring flex items-center gap-2 rounded-full px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
              style={{ backgroundColor: INK }}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Création…' : 'Créer le tournoi'}
            </button>
          </div>
        </div>

        <CheckerEdge accent={GOLD} squares={40} />
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10';

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
      <span className="mb-2 block font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
        {label}
        {required && <span style={{ color: GOLD }}> *</span>}
      </span>
      {children}
    </label>
  );
}

function SegmentedNumber({
  options,
  value,
  onChange,
  className = '',
}: {
  options: number[];
  value: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  return (
    <div className={`flex overflow-hidden rounded-xl border ${className}`} style={{ borderColor: RULE }}>
      {options.map((n, i) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`focus-ring flex-1 py-2.5 font-mono text-sm font-semibold tabular transition-colors ${
              i > 0 ? 'border-l' : ''
            }`}
            style={{
              borderColor: RULE,
              backgroundColor: active ? INK : '#fff',
              color: active ? '#fff' : '#8A8A90',
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
