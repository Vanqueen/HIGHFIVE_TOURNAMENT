import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarDays,
  Radio,
  ArrowRight,
  X,
} from 'lucide-react';
import { useTournaments } from '../hooks/useTournaments';
import type { Tournament } from '../types';
import { INK, GOLD, GOLD_DARK, PURPLE, GREEN } from '../components/landing/tokens';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/* Semaine à la française : lundi en tête. */
const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function statusBadge(status: Tournament['status']) {
  switch (status) {
    case 'registration': return { label: 'Inscriptions ouvertes', color: GREEN };
    case 'in_progress':  return { label: 'En cours', color: GOLD_DARK };
    case 'completed':    return { label: 'Terminé', color: '#9CA3AF' };
    default:             return { label: 'À venir', color: PURPLE };
  }
}

function longDate(d: Date) {
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/* Distance en jours pleins, calculée sur les dates seules — sinon un
   tournoi de ce soir passerait pour « hier ». */
function daysFromToday(target: Date, today: Date) {
  const a = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.round((a - b) / 86_400_000);
}

function countdown(delta: number) {
  if (delta === 0) return "Aujourd'hui";
  if (delta === 1) return 'Demain';
  if (delta > 1) return `Dans ${delta} jours`;
  if (delta === -1) return 'Hier';
  return `Il y a ${Math.abs(delta)} jours`;
}

/* ------------------------------------------------------------------ */
/*  Ligne d'événement — même vocabulaire dans le panneau et l'agenda   */
/* ------------------------------------------------------------------ */
function EventRow({ tournament, date, today, onOpen }: {
  tournament: Tournament;
  date: Date | null;
  today: Date;
  onOpen: (id: string) => void;
}) {
  const badge = statusBadge(tournament.status);
  const delta = date ? daysFromToday(date, today) : null;

  return (
    <button
      onClick={() => onOpen(tournament.id)}
      className="group w-full rounded-2xl border border-black/5 bg-white dark:bg-gray-700 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-28px_rgba(17,17,20,0.6)]"
    >
      <div className="flex items-start gap-4">
        {/* Pastille date : le repère chiffré, comme sur une feuille de ronde */}
        {date && (
          <div
            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-black/5"
            style={{ backgroundColor: '#F7F6F4' }}
          >
            <span className="tabular font-mono text-xl font-semibold leading-none">{date.getDate()}</span>
            <span className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-gray-400">
              {MONTHS[date.getMonth()].slice(0, 3)}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: badge.color }} />
            <span
              className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]"
              style={{ color: badge.color }}
            >
              {badge.label}
            </span>
            {delta !== null && delta >= 0 && tournament.status !== 'completed' && (
              <span className="ml-auto shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-gray-400">
                {countdown(delta)}
              </span>
            )}
          </div>

          <h4 className="mt-2 truncate font-display text-2xl font-bold uppercase leading-none tracking-tight">
            {tournament.name}
          </h4>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            {tournament.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" style={{ color: GOLD }} />
                {tournament.location}
              </span>
            )}
            <span className="tabular font-mono">{tournament.total_rounds} rondes</span>
            {tournament.status === 'in_progress' && (
              <span className="tabular font-mono font-semibold" style={{ color: GOLD_DARK }}>
                R{tournament.current_round}/{tournament.total_rounds}
              </span>
            )}
          </div>
        </div>

        <ArrowRight
          className="mt-1 h-4 w-4 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
          style={{ color: GOLD }}
        />
      </div>
    </button>
  );
}

export function CalendarPage({ onTournamentClick }: { onTournamentClick: (id: string) => void }) {
  const { tournaments, loading } = useTournaments();
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string | null>(null);

  /* Index date → tournois. Un tournoi sans date reste hors calendrier :
     on le montre à part plutôt que de lui inventer un jour. */
  const { byDay, dated, undated } = useMemo(() => {
    const map = new Map<string, { tournament: Tournament; date: Date }[]>();
    const withDate: { tournament: Tournament; date: Date }[] = [];
    const without: Tournament[] = [];

    for (const t of tournaments) {
      if (!t.start_date) { without.push(t); continue; }
      const date = new Date(t.start_date);
      if (Number.isNaN(date.getTime())) { without.push(t); continue; }
      const entry = { tournament: t, date };
      withDate.push(entry);
      const key = dayKey(date);
      map.set(key, [...(map.get(key) ?? []), entry]);
    }

    withDate.sort((a, b) => a.date.getTime() - b.date.getTime());
    return { byDay: map, dated: withDate, undated: without };
  }, [tournaments]);

  const live = dated.filter((e) => e.tournament.status === 'in_progress');
  const upcoming = dated.filter(
    (e) => e.tournament.status !== 'completed' && daysFromToday(e.date, today) >= 0
  );
  const nextUp = upcoming[0] ?? null;

  /* --- Grille du mois : 6 semaines pleines, débordements compris --- */
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(new Date(year, month, i + 1 - offset));

  const todayKey = dayKey(today);
  const selectedDate = selected ? new Date(`${selected}T00:00:00`) : null;
  const selectedEvents = selected ? byDay.get(selected) ?? [] : [];

  const shiftMonth = (step: number) => {
    setCursor(new Date(year, month + step, 1));
    setSelected(null);
  };

  const goToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(todayKey);
  };

  return (
    <div style={{ color: INK }}>
      {/* ============================================================
          Bandeau — le calendrier s'annonce avant de se lire
          ============================================================ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: INK }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              `linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%),` +
              `linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%)`,
            backgroundSize: '64px 64px',
            backgroundPosition: '0 0, 32px 32px',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 60% 100% at 82% 0%, ${GOLD}2b 0%, transparent 62%)` }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-12 lg:pb-28">
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.34em]" style={{ color: GOLD }}>
            Calendrier des compétitions
          </p>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
            <h1 className="font-display text-6xl font-bold uppercase leading-[0.9] tracking-tight text-white sm:text-7xl">
              Chaque ronde
              <br />
              <span style={{ color: GOLD }}>a son heure</span>
            </h1>

            {nextUp && (
              <div className="rounded-2xl border border-white/10 bg-white dark:bg-gray-700/[0.04] px-6 py-5 backdrop-blur-sm">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/40">
                  Prochain rendez-vous
                </p>
                <p className="mt-2 font-display text-2xl font-bold uppercase leading-none tracking-tight text-white">
                  {nextUp.tournament.name}
                </p>
                <p className="tabular mt-2 font-mono text-xs" style={{ color: GOLD }}>
                  {longDate(nextUp.date)} · {countdown(daysFromToday(nextUp.date, today))}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          Grille + panneau latéral
          ============================================================ */}
      <div className="mx-auto -mt-16 max-w-7xl px-6 pb-24 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* ---------------------------- Mois ---------------------------- */}
          <div className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-white dark:bg-gray-700 shadow-[0_30px_60px_-45px_rgba(17,17,20,0.7)]">
            <div className="flex items-center justify-between border-b border-black/5 px-7 py-6">
              <div>
                <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight">
                  {MONTHS[month]}
                </h2>
                <p className="tabular mt-1.5 font-mono text-xs tracking-[0.2em] text-gray-400">{year}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToday}
                  className="rounded-full border border-black/10 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] transition-colors hover:border-black/30"
                >
                  Aujourd&apos;hui
                </button>
                <button
                  onClick={() => shiftMonth(-1)}
                  aria-label="Mois précédent"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-colors hover:border-black/30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => shiftMonth(1)}
                  aria-label="Mois suivant"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-colors hover:border-black/30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* En-tête des jours */}
            <div className="grid grid-cols-7 border-b border-black/5 px-3 py-3">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-center font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-gray-400"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Cellules */}
            <div key={`${year}-${month}`} className="grid grid-cols-7 gap-1.5 p-3">
              {cells.map((date, i) => {
                const key = dayKey(date);
                const outside = date.getMonth() !== month;
                const events = byDay.get(key) ?? [];
                const isToday = key === todayKey;
                const isSelected = key === selected;
                const hasLive = events.some((e) => e.tournament.status === 'in_progress');
                const accent = hasLive ? GOLD_DARK : events[0] ? statusBadge(events[0].tournament.status).color : GOLD;

                return (
                  <button
                    key={key}
                    onClick={() => setSelected(isSelected ? null : key)}
                    disabled={events.length === 0}
                    className="cell-in relative flex aspect-square flex-col items-center justify-center rounded-xl transition-colors disabled:cursor-default"
                    style={{
                      animationDelay: `${i * 6}ms`,
                      backgroundColor: isSelected ? INK : events.length ? '#F7F6F4' : 'transparent',
                      boxShadow: isToday && !isSelected ? `inset 0 0 0 1.5px ${GOLD}` : undefined,
                      opacity: outside ? 0.32 : 1,
                    }}
                  >
                    <span
                      className="tabular font-mono text-sm"
                      style={{
                        color: isSelected ? '#fff' : outside ? '#9CA3AF' : INK,
                        fontWeight: events.length ? 600 : 400,
                      }}
                    >
                      {date.getDate()}
                    </span>

                    {/* Points d'événement — trois au plus, puis un compteur */}
                    {events.length > 0 && (
                      <span className="absolute bottom-2 flex items-center gap-1">
                        {events.slice(0, 3).map((e, j) => (
                          <span
                            key={j}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor: isSelected ? '#fff' : statusBadge(e.tournament.status).color,
                            }}
                          />
                        ))}
                        {events.length > 3 && (
                          <span
                            className="font-mono text-[0.55rem] leading-none"
                            style={{ color: isSelected ? '#fff' : accent }}
                          >
                            +{events.length - 3}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Légende */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-black/5 px-7 py-5">
              {[
                { label: 'Inscriptions ouvertes', color: GREEN },
                { label: 'En cours', color: GOLD_DARK },
                { label: 'Terminé', color: '#9CA3AF' },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-2 text-[0.7rem] text-gray-500">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
              ))}
              <span className="flex items-center gap-2 text-[0.7rem] text-gray-500">
                <span className="h-3 w-3 rounded" style={{ boxShadow: `inset 0 0 0 1.5px ${GOLD}` }} />
                Aujourd&apos;hui
              </span>
            </div>
          </div>

          {/* -------------------------- Panneau -------------------------- */}
          <aside className="space-y-5">
            {loading ? (
              <>
                <div className="skeleton h-32 rounded-2xl" />
                <div className="skeleton h-32 rounded-2xl" />
              </>
            ) : selectedDate ? (
              <section className="rounded-[1.75rem] border border-black/5 bg-white dark:bg-gray-700 p-6 shadow-[0_24px_50px_-42px_rgba(17,17,20,0.6)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-gray-400">
                      Journée sélectionnée
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-bold uppercase leading-none tracking-tight">
                      {longDate(selectedDate)}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    aria-label="Fermer la journée"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-gray-400 transition-colors hover:border-black/30 hover:text-gray-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {selectedEvents.length === 0 ? (
                    <p className="text-sm text-gray-400">Aucun événement ce jour-là.</p>
                  ) : (
                    selectedEvents.map((e) => (
                      <EventRow
                        key={e.tournament.id}
                        tournament={e.tournament}
                        date={null}
                        today={today}
                        onOpen={onTournamentClick}
                      />
                    ))
                  )}
                </div>
              </section>
            ) : (
              <>
                {live.length > 0 && (
                  <section>
                    <div className="mb-3 flex items-center gap-2.5 px-1">
                      <span className="relative flex h-2 w-2">
                        <span
                          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                          style={{ backgroundColor: GOLD_DARK }}
                        />
                        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: GOLD_DARK }} />
                      </span>
                      <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD_DARK }}>
                        En cours maintenant
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {live.map((e) => (
                        <EventRow
                          key={e.tournament.id}
                          tournament={e.tournament}
                          date={e.date}
                          today={today}
                          onOpen={onTournamentClick}
                        />
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <div className="mb-3 flex items-center gap-2.5 px-1">
                    <CalendarDays className="h-3.5 w-3.5" style={{ color: GOLD }} />
                    <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-500">
                      À venir
                    </h3>
                  </div>

                  {upcoming.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center">
                      <Radio className="mx-auto mb-3 h-6 w-6" style={{ color: GOLD }} />
                      <p className="text-sm text-gray-400">
                        Aucune date annoncée pour l&apos;instant. Les prochaines éditions s&apos;afficheront ici.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcoming.slice(0, 5).map((e) => (
                        <EventRow
                          key={e.tournament.id}
                          tournament={e.tournament}
                          date={e.date}
                          today={today}
                          onOpen={onTournamentClick}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {undated.length > 0 && (
                  <section>
                    <div className="mb-3 px-1">
                      <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">
                        Date à confirmer
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {undated.map((t) => (
                        <EventRow
                          key={t.id}
                          tournament={t}
                          date={null}
                          today={today}
                          onOpen={onTournamentClick}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
