import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight, Trophy, Users, ShieldCheck, Radio, User } from 'lucide-react';
import { INK, GOLD, GOLD_DARK, PURPLE, GREEN } from '../components/landing/tokens';
import { LandingFooter } from '../components/landing/LandingFooter';
import type { User as AuthUser } from '../types';
import kingCutout from '../assets/image2.png';
import knightCutout from '../assets/image3.jpg';
import queenBoard from '../assets/image4.jpg';
import kingsDuel from '../assets/image5.jpg';
import KingGold from '../assets/GoldChessKing.png'

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
    title: 'Des règles respectées',
    text: "Appariements, départages et résultats sont gérés selon les principes utilisés dans l’organisation des tournois. Chaque information affichée doit être fiable et cohérente.",
  },
  {
    n: '02',
    accent: PURPLE,
    bg: PURPLE,
    icon: <Radio className="h-5 w-5 text-white" />,
    title: 'Une information en temps réel',
    text: "Dès qu’un résultat est enregistré, il est immédiatement pris en compte dans le classement, le tableau du tournoi et l’espace du joueur. Tous les participants disposent ainsi de la même information.",
  },
  {
    n: '03',
    accent: GREEN,
    bg: GREEN,
    icon: <ShieldCheck className="h-5 w-5 text-white" />,
    title: 'Chacun sa place',
    text: "L’inscription est accessible aux joueurs tandis que la création et la gestion des tournois restent réservées aux organisateurs autorisés. Chacun dispose ainsi d’un rôle clairement défini.",
  },
];

const STEPS = [
  {
    year: '2024',
    title: 'Les premières parties',
    text: "Quelques collaborateurs de VIPP Digital Services commencent à se retrouver autour de l’échiquier. Ces premières parties font naître l’idée de créer un véritable espace dédié aux passionnés d’échecs au sein de l’entreprise.",
  },
  {
    year: '2025',
    title: 'Les débuts du club',
    text: "L’idée prend forme : plusieurs collaborateurs se réunissent et s’organisent pour donner vie au club d’échecs de VIPP Digital Services. Les premières habitudes de jeu et de rencontre commencent à s’installer.",
  },
  {
    year: '2025',
    title: 'Le premier tournoi',
    text: "Le club franchit une nouvelle étape avec l’organisation de son premier tournoi. Cette première compétition permet de structurer l’organisation des parties et pose les bases des futurs tournois du club.",
  },
  {
    year: '2026',
    title: 'Une plateforme ouverte',
    text: "L’aventure évolue avec la création d’une plateforme dédiée à la gestion des tournois, aux inscriptions et au suivi des joueurs. Le projet ne se limite plus à l’organisation interne du club et commence à s’ouvrir à une communauté plus large de passionnés.",
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
    <div className="text-[#111114] dark:text-[#F8EFE7]">
      {/* ============================================================
          1 — OUVERTURE
          ============================================================ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: INK }}>
        {/* Visuel : duel de rois, fondu vers la gauche pour laisser le texte respirer */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-[70%] lg:w-[62%]">
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

        <div className="relative mx-auto flex min-h-[82vh] max-w-7xl items-center px-6 py-20 md:py-24 lg:px-12">
          <div className="max-w-2xl">
            <Reveal>
              <Overline>À propos — VIPP DIGITAL SERVICES CHESS CLUB</Overline>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="mt-6 font-display text-4xl font-bold uppercase leading-[0.92] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-8xl">
                L&apos;échiquier,
                <br />
                notre terrain
                <br />
                <span style={{ color: GOLD }}> de jeu</span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-10 flex gap-5">
                <span className="mt-1 h-16 w-[3px] shrink-0 rounded-full" style={{ backgroundColor: GOLD }} />
                <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                  Nous sommes le club d&apos;échecs des collaborateurs de VIPP Digital Services. 
                  Né de l&apos;envie de partager notre passion pour les échecs, le club s&apos;est progressivement doté de sa propre plateforme pour simplifier l’organisation des tournois, automatiser les appariements et permettre à chacun de suivre les résultats en direct.
                </p>
              </div>
            </Reveal>

            <Reveal delay={270}>
              <div className="mt-12 flex flex-wrap gap-3">
                <button
                  onClick={onSeeTournaments}
                  aria-label="Voir les tournois"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--surface-card-strong)] px-5 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-[color:var(--text-primary)] transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: GOLD, color: INK }}
                >
                  <ArrowRight className="h-5 w-5 sm:hidden" />
                  <span className="hidden sm:inline-flex items-center gap-2">
                    Voir les tournois
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
                <button
                  onClick={user ? onDashboard : onLogin}
                  aria-label={user ? 'Accéder à mon espace' : 'Rejoindre la plateforme'}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-white/60"
                >
                  <User className="h-5 w-5 sm:hidden" />
                  <span className="hidden sm:inline">{user ? 'Mon espace' : 'Rejoindre la plateforme'}</span>
                </button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Liseré doré : signature de bas de section */}
        <div className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD}00 68%)` }} />
      </section>

      {/* ============================================================
          2 — MANIFESTE / POURQUOI LA PLATEFORME ?
          ============================================================ */}
      <section className="relative overflow-hidden bg-white dark:bg-[#1e1535]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-32">
          <div>
            <Reveal>
              <Overline>Notre vision</Overline>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
                Des tournois
                <br />
                <span style={{ color: GOLD }}>plus simples, plus fiables</span>
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <div className="mt-9 space-y-6 text-[1.05rem] leading-[1.75] text-gray-600 dark:text-[#CBB9D8]">
                <p>
                  Nos premiers tournois internes reposaient sur des outils classiques : fichiers partagés, saisie manuelle des résultats et calculs des départages. À mesure que le nombre de participants augmentait, ces méthodes devenaient plus difficiles à gérer.
                </p>
                <p>
                  <strong className="font-semibold text-[#111114] dark:text-[#F8EFE7]">
                    Nous avons donc créé notre propre plateforme pour centraliser l’organisation des compétitions.
                  </strong>{' '}
                  Les appariements sont calculés automatiquement, les résultats sont saisis une seule fois et les classements sont mis à jour en temps réel. L&apos;organisateur peut ainsi se concentrer sur l&apos;essentiel : faire vivre le tournoi.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-black/10 dark:bg-white/10 grid-cols-3">
                {[
                  { k: 'Appariements', v: 'Système suisse' },
                  { k: 'Départages', v: 'BH · SB' },
                  { k: 'Diffusion', v: 'Temps réel' },
                ].map((cell) => (
                  <div key={cell.k} className="bg-white dark:bg-[#1e1535] px-3 py-4 md:px-5 md:py-5">
                    <p className="font-mono text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.2em] text-gray-400">{cell.k}</p>
                    <p className="mt-2 font-display text-lg md:text-2xl font-bold uppercase tracking-tight">{cell.v}</p>
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
          3 — VALEURS / NOS ENGAGEMENTS
          ============================================================ */}
      <section className="bg-[#F7F6F4] dark:bg-[#251C3A]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-32">
          <Reveal>
            <Overline color={GOLD_DARK}>Ce qui nous guide</Overline>
            <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
              Trois engagements pour chaque tournoi
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {VALUES.map((value, i) => (
              <Reveal key={value.n} delay={i * 110}>
                <article className="group relative h-full overflow-hidden rounded-[1.75rem] border border-black/5 dark:border-white/10 bg-white dark:bg-[#1e1535] p-9 shadow-[0_24px_50px_-40px_rgba(17,17,20,0.55)] transition-transform duration-300 hover:-translate-y-1.5">
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
                    <span className="tabular font-mono text-4xl font-semibold text-black/[0.07] dark:text-white/10">{value.n}</span>
                  </div>
                  <h3 className="mt-7 font-display text-3xl font-bold uppercase tracking-tight">{value.title}</h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-gray-500 dark:text-[#CBB9D8]">{value.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          4 — PARCOURS
          ============================================================ */}
      <section className="relative overflow-hidden bg-white dark:bg-[#1e1535]">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-12 lg:py-32">
          {/* Roi détouré, en veille sur la colonne de gauche */}
          <Reveal className="relative hidden lg:block">
            <div className="sticky top-24">
              <Overline>Notre parcours</Overline>
              {/* <Overline>NOTRE HISTOIRE</Overline> */}
              <h2 className="mt-5 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight">
                Du club interne
                <br />
                <span style={{ color: GOLD }}>à une plateforme</span>
                <br />
                dédiée
              </h2>
              <div className="relative mt-10 h-80">
                <div
                  className="absolute inset-0"
                  style={{ background: `radial-gradient(circle at 50% 60%, ${GOLD}22 0%, transparent 64%)` }}
                />
                <img
                  src={KingGold}
                  alt="Roi or"
                  className="relative h-full w-full object-contain"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
            </div>
          </Reveal>

          <div>
            <div className="lg:hidden">
              <Overline>Le parcours</Overline>
              <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl">
                Du club interne à <span style={{ color: GOLD }}> une plateforme dédiée</span>
              </h2>
            </div>

            <ol className="mt-10 lg:mt-0">
              {STEPS.map((step, i) => (
                <Reveal key={`${step.year}-${i}`} delay={i * 90}>
                  <li className="relative grid grid-cols-[auto_1fr] gap-6 pb-12 last:pb-0">
                    {/* Rail vertical + pastille */}
                    <div className="relative flex flex-col items-center">
                      <span
                        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full font-mono text-[0.7rem] font-semibold text-white bg-[#111114] dark:bg-[#F8EFE7] dark:text-[#111114]"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {i < STEPS.length - 1 && (
                        <span className="absolute top-12 h-full w-px bg-gradient-to-b from-black/15 dark:from-white/15 to-transparent" />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className="tabular font-mono text-sm font-semibold" style={{ color: GOLD }}>
                        {step.year}
                      </p>
                      <h3 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight">{step.title}</h3>
                      <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-gray-500 dark:text-[#CBB9D8]">{step.text}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============================================================
          5 — APPEL FINAL
          ============================================================ */}
      <section className="px-6 pt-16 pb-16 md:pt-24 md:pb-24 lg:px-12">
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

            <div className="relative grid gap-10 px-8 py-12 sm:px-14 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
              <div>
                <h2 className="mt-7 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl">
                  Rejoignez
                  <span style={{ color: GOLD }}> la partie</span>
                </h2>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-white/60">
                  Que vous soyez joueur ou organisateur, la plateforme vous permet de participer à des tournois et de suivre votre progression simplement.
                  <br/>
                  Créez votre compte joueur en quelques instants et inscrivez-vous au prochain tournoi. Vous souhaitez organiser une compétition ? Contactez-nous pour découvrir les modalités d’accès aux fonctionnalités organisateur.
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
                  <a href="mailto:contact@vipp-digital.com" aria-label='Devenir organisateur'
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

      <LandingFooter />
    </div>
  );
}
