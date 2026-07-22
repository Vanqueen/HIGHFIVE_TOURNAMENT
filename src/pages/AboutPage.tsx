import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight, Trophy, Users, ShieldCheck, Radio, Sparkles } from 'lucide-react';
import { INK, GOLD, GOLD_DARK, PURPLE, GREEN } from '../components/landing/tokens';
import type { User as AuthUser } from '../types';
import boardImage from '../assets/image.png';
import kingCutout from '../assets/image2.jpg';
import knightCutout from '../assets/image3.jpg';
import queenBoard from '../assets/image4.jpg';
import kingsDuel from '../assets/image5.jpg';

/* Motif d'échiquier — sert de texture de fond, jamais de décor isolé. */
function boardPattern(color: string, size = 28) {
  return {
    backgroundImage:
      `linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%),` +
      `linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%)`,
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `0 0, ${size / 2}px ${size / 2}px`,
  };
}

/* Les blocs se posent à l'entrée dans le viewport, comme les cellules
   d'une feuille de résultats. Un seul mouvement, jamais rejoué. */
function Reveal({ children, delay = 0, className = '' }: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(22px)',
        transition: `opacity 620ms cubic-bezier(0.2,0.7,0.3,1) ${delay}ms, transform 620ms cubic-bezier(0.2,0.7,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Overline({ children, color = GOLD }: { children: ReactNode; color?: string }) {
  return (
    <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.34em]" style={{ color }}>
      {children}
    </p>
  );
}

const VALUES = [
  {
    n: '01',
    accent: GOLD_DARK,
    bg: GOLD,
    icon: <Trophy className="h-5 w-5 text-white" />,
    title: 'La règle avant tout',
    text: "Appariements suisses, départages, feuille de match : la plateforme applique les usages de l'arbitrage sans raccourci. Ce qui est affiché fait foi.",
  },
  {
    n: '02',
    accent: PURPLE,
    bg: PURPLE,
    icon: <Radio className="h-5 w-5 text-white" />,
    title: 'Le direct, sans latence',
    text: "Un résultat saisi par l'arbitre apparaît dans la seconde sur le classement, le tableau et l'espace de chaque joueur. La salle et le public voient la même chose.",
  },
  {
    n: '03',
    accent: GREEN,
    bg: GREEN,
    icon: <ShieldCheck className="h-5 w-5 text-white" />,
    title: 'Chacun sa place',
    text: "L'inscription est ouverte aux joueurs. La création de tournoi reste entre les mains des organisateurs accrédités : la confiance ne se déclare pas, elle se coopte.",
  },
];

const STATS = [
  { value: '1K+', label: 'Joueurs inscrits' },
  { value: '25+', label: 'Tournois arbitrés' },
  { value: '12', label: 'Pays représentés' },
  { value: '0', label: 'Feuille perdue' },
];

const STEPS = [
  {
    year: '2023',
    title: 'Les premières parties',
    text: "Quelques collaborateurs de VIPP Digital Services posent un échiquier entre deux réunions. Le club est né ; ses tournois tiennent encore dans un tableur.",
  },
  {
    year: '2024',
    title: 'Le moteur d’appariement',
    text: "Premier système suisse complet : appariements, flottants, départages Buchholz et Sonneborn-Berger. Testé sur des tournois réels, corrigé par des arbitres.",
  },
  {
    year: '2025',
    title: 'La salle connectée',
    text: "Les joueurs suivent leur ronde depuis leur téléphone, le public depuis l'écran de la salle. Le tableau final se génère tout seul.",
  },
  {
    year: '2026',
    title: 'Le club s’ouvre',
    text: "Inscriptions en ligne, classements permanents, profils de joueurs. Ce qui était l'outil d'un club d'entreprise accueille désormais les passionnés du dehors.",
  },
];

export function AboutPage({
  user,
  onLogin,
  onDashboard,
  onSeeTournaments,
}: {
  user: AuthUser | null;
  onLogin: () => void;
  onDashboard: () => void;
  onSeeTournaments: () => void;
}) {
  return (
    <div style={{ color: INK }}>
      {/* ============================================================
          1 — OUVERTURE
          ============================================================ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: INK }}>
        {/* Visuel : duel de rois, fondu vers la gauche pour laisser le texte respirer */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[62%]">
          <img
            src={kingsDuel}
            alt="Roi blanc dressé face à un roi noir renversé"
            className="h-full w-full object-cover object-[center_35%]"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 26%, rgba(0,0,0,0.9) 52%, #000 70%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 26%, rgba(0,0,0,0.9) 52%, #000 70%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(circle at 66% 44%, ${GOLD}33 0%, transparent 62%)` }}
          />
        </div>

        {/* Colonne d'échiquier en bord de page */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-14 opacity-[0.07] lg:block"
          style={boardPattern('#ffffff', 56)}
        />

        <div className="relative mx-auto flex min-h-[82vh] max-w-7xl items-center px-6 py-24 lg:px-12">
          <div className="max-w-2xl">
            <Reveal>
              <Overline>À propos — VIPP Digital Services</Overline>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="mt-6 font-display text-6xl font-bold uppercase leading-[0.92] tracking-tight text-white sm:text-7xl lg:text-8xl">
                L&apos;échiquier
                <br />
                comme terrain
                <br />
                <span style={{ color: GOLD }}>de vérité</span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-10 flex gap-5">
                <span className="mt-1 h-16 w-[3px] shrink-0 rounded-full" style={{ backgroundColor: GOLD }} />
                <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                  Nous sommes le club d&apos;échecs des collaborateurs de VIPP Digital Services. Faute
                  d&apos;outil à notre goût, nous avons construit le nôtre : une plateforme où un
                  tournoi se crée en dix minutes, s&apos;arbitre sans tableur et se suit en direct.
                </p>
              </div>
            </Reveal>

            <Reveal delay={270}>
              <div className="mt-12 flex flex-wrap gap-3">
                <button
                  onClick={onSeeTournaments}
                  className="flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: GOLD, color: INK }}
                >
                  Voir les tournois
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={user ? onDashboard : onLogin}
                  className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-white/60"
                >
                  {user ? 'Mon espace' : 'Rejoindre la plateforme'}
                </button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Liseré doré : signature de bas de section */}
        <div className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD}00 68%)` }} />
      </section>

      {/* ============================================================
          2 — MANIFESTE
          ============================================================ */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-32">
          <div>
            <Reveal>
              <Overline>Le manifeste</Overline>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl">
                Un tournoi n&apos;est pas
                <br />
                <span style={{ color: GOLD }}>un fichier Excel</span>
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <div className="mt-9 space-y-6 text-[1.05rem] leading-[1.75] text-gray-600">
                <p>
                  Nos premiers tournois internes tenaient dans un classeur partagé : un collègue
                  recopiait les scores à la main, un autre recomptait les Buchholz le soir venu, et
                  personne ne savait contre qui il jouait avant l&apos;affichage.
                </p>
                <p>
                  <strong className="font-semibold" style={{ color: INK }}>
                    Alors nous avons codé ce qui nous manquait.
                  </strong>{' '}
                  Les appariements sont calculés, les résultats saisis une seule fois, les
                  classements recalculés à l&apos;instant. Ce qui reste à l&apos;organisateur, c&apos;est le
                  tournoi lui-même.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-3">
                {[
                  { k: 'Appariements', v: 'Suisse' },
                  { k: 'Départages', v: 'BH · SB' },
                  { k: 'Diffusion', v: 'Temps réel' },
                ].map((cell) => (
                  <div key={cell.k} className="bg-white px-5 py-5">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-gray-400">{cell.k}</p>
                    <p className="mt-2 font-display text-2xl font-bold uppercase tracking-tight">{cell.v}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Cavalier détouré, posé sur une trame d'échiquier */}
          <Reveal delay={120} className="relative">
            <div className="relative mx-auto aspect-square w-full max-w-lg">
              <div
                className="absolute inset-0 rounded-[2.5rem]"
                style={{ background: `radial-gradient(circle at 50% 45%, ${GOLD}26 0%, transparent 66%)` }}
              />
              <div
                className="absolute inset-x-8 bottom-6 top-12 rounded-[2rem] opacity-[0.12]"
                style={boardPattern(INK, 40)}
              />
              <img
                src={knightCutout}
                alt="Cavalier noir"
                className="relative h-full w-full object-contain drop-shadow-[0_30px_45px_rgba(17,17,20,0.28)]"
                style={{ mixBlendMode: 'multiply' }}
              />
              <div
                className="absolute -left-2 top-8 hidden rotate-180 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-gray-400 lg:block"
                style={{ writingMode: 'vertical-rl' }}
              >
                Nf3 — le coup qui ouvre
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================
          3 — CHIFFRES (feuille de résultats)
          ============================================================ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: INK }}>
        <img
          src={boardImage}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]"
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${INK} 8%, ${INK}bb 50%, ${INK} 92%)` }} />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <Reveal>
            <div className="flex items-center gap-4">
              <Overline>La plateforme en chiffres</Overline>
              <span className="h-px flex-1 bg-white/15" />
            </div>
          </Reveal>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 90}>
                <div className="h-full px-7 py-9" style={{ backgroundColor: INK }}>
                  <p className="tabular font-mono text-5xl font-semibold" style={{ color: GOLD }}>
                    {stat.value}
                  </p>
                  <p className="mt-3 text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-white/50">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          4 — VALEURS
          ============================================================ */}
      <section className="bg-[#F7F6F4]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
          <Reveal>
            <Overline color={GOLD_DARK}>Ce qui nous tient</Overline>
            <h2 className="mt-5 max-w-3xl font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Trois principes, jamais négociés
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {VALUES.map((value, i) => (
              <Reveal key={value.n} delay={i * 110}>
                <article className="group relative h-full overflow-hidden rounded-[1.75rem] border border-black/5 bg-white p-9 shadow-[0_24px_50px_-40px_rgba(17,17,20,0.55)] transition-transform duration-300 hover:-translate-y-1.5">
                  <span
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                    style={{ backgroundColor: value.bg }}
                  />
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: value.bg }}
                    >
                      {value.icon}
                    </div>
                    <span className="tabular font-mono text-4xl font-semibold text-black/[0.07]">{value.n}</span>
                  </div>
                  <h3 className="mt-7 font-display text-3xl font-bold uppercase tracking-tight">{value.title}</h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-gray-500">{value.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          5 — PARCOURS
          ============================================================ */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-[0.85fr_1.15fr] lg:px-12 lg:py-32">
          {/* Roi détouré, en veille sur la colonne de gauche */}
          <Reveal className="relative hidden lg:block">
            <div className="sticky top-24">
              <Overline>Le parcours</Overline>
              <h2 className="mt-5 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight">
                Quatre ans
                <br />
                <span style={{ color: GOLD }}>à corriger</span>
                <br />
                la copie
              </h2>
              <div className="relative mt-10 h-80">
                <div
                  className="absolute inset-0"
                  style={{ background: `radial-gradient(circle at 50% 60%, ${GOLD}22 0%, transparent 64%)` }}
                />
                <img
                  src={kingCutout}
                  alt="Roi noir"
                  className="relative h-full w-full object-contain"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
            </div>
          </Reveal>

          <div>
            <div className="lg:hidden">
              <Overline>Le parcours</Overline>
              <h2 className="mt-5 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight">
                Quatre ans à <span style={{ color: GOLD }}>corriger la copie</span>
              </h2>
            </div>

            <ol className="mt-10 lg:mt-0">
              {STEPS.map((step, i) => (
                <Reveal key={step.year} delay={i * 90}>
                  <li className="relative grid grid-cols-[auto_1fr] gap-6 pb-12 last:pb-0">
                    {/* Rail vertical + pastille */}
                    <div className="relative flex flex-col items-center">
                      <span
                        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full font-mono text-[0.7rem] font-semibold text-white"
                        style={{ backgroundColor: INK }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {i < STEPS.length - 1 && (
                        <span className="absolute top-12 h-full w-px bg-gradient-to-b from-black/15 to-transparent" />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className="tabular font-mono text-sm font-semibold" style={{ color: GOLD }}>
                        {step.year}
                      </p>
                      <h3 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight">{step.title}</h3>
                      <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-gray-500">{step.text}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============================================================
          6 — APPEL FINAL
          ============================================================ */}
      <section className="px-6 pb-24 lg:px-12">
        <Reveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem]" style={{ backgroundColor: INK }}>
            <img
              src={queenBoard}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2 object-cover object-center opacity-70"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.7) 45%, #000 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.7) 45%, #000 100%)',
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: `radial-gradient(circle at 78% 50%, ${GOLD}2e 0%, transparent 58%)` }}
            />

            <div className="relative grid gap-10 px-8 py-16 sm:px-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
              <div>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.2em]"
                  style={{ backgroundColor: `${GOLD}1f`, color: GOLD }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Prochaine ronde
                </span>
                <h2 className="mt-7 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl">
                  Une place vous
                  <br />
                  <span style={{ color: GOLD }}>attend à la table</span>
                </h2>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-white/60">
                  Créez votre compte joueur en une minute et inscrivez-vous au prochain tournoi. Pour
                  organiser une compétition, écrivez-nous : les accès organisateur s&apos;ouvrent au cas
                  par cas.
                </p>

                <div className="mt-10 flex flex-wrap gap-3">
                  <button
                    onClick={user ? onDashboard : onLogin}
                    className="flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] transition-transform hover:-translate-y-0.5"
                    style={{ backgroundColor: GOLD, color: INK }}
                  >
                    <Users className="h-4 w-4" />
                    {user ? 'Mon espace' : 'Créer un compte joueur'}
                  </button>
                  <a
                    href="mailto:contact@vipp-digital.com"
                    className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-white/60"
                  >
                    Devenir organisateur
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
