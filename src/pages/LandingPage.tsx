import { useEffect, useState } from 'react';
import {
  Search,
  Menu,
  X,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Globe2,
  ArrowRight,
  ChevronRight,
  User,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { useTournaments } from '../hooks/useTournaments';
/* `User` est déjà pris par l'icône lucide importée plus haut. */
import type { Tournament, User as AuthUser } from '../types';
import chessHeroImage from '../assets/image.png';

/* ------------------------------------------------------------------ */
/*  Design tokens — repris de la maquette                              */
/*  ink   : texte quasi-noir / boutons primaires                       */
/*  gold  : accent de marque (couronne, titre, icônes)                 */
/*  purple: badge « saison / à venir »                                 */
/*  green : badge « inscriptions ouvertes »                            */
/* ------------------------------------------------------------------ */
const INK = '#111114';
const GOLD = '#C6963B';
const GOLD_DARK = '#A87A2C';
const PURPLE = '#5B3E96';
const GREEN = '#3E9B4F';

const NAV_ITEMS = ['Accueil', 'Tournois', 'Compétitions', 'Classements', 'Joueurs', 'Actualités', 'À propos'];

/* Une seule photo en asset : on la recadre différemment pour chaque
   vignette de tournoi afin d'obtenir 4 visuels distincts. */
const THUMB_CROPS = ['22% 62%', '62% 38%', '84% 70%', '44% 80%'];

export function LandingPage({
  user,
  onLogin,
  onDashboard,
  onTournamentClick,
}: {
  /* null quand personne n'est connecté : l'en-tête bascule alors sur
     les boutons « Se connecter » / « S'inscrire ». */
  user: AuthUser | null;
  onLogin: () => void;
  onDashboard: () => void;
  onTournamentClick: (id: string) => void;
}) {
  const { tournaments, loading } = useTournaments();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* Verrouille le scroll du document tant que la landing est affichée
     (uniquement en desktop — cf. media query dans index.css). */
  useEffect(() => {
    document.documentElement.classList.add('landing-lock');
    return () => document.documentElement.classList.remove('landing-lock');
  }, []);

  const featured = tournaments.length > 0 ? tournaments[0] : null;
  const upcoming = tournaments.slice(0, 4);

  return (
    <div className="landing-fixed flex flex-col" style={{ color: INK }}>
      {/* ============================= HEADER ============================= */}
      <header className="relative z-40 flex-none border-b border-black/5 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[8.8em] max-w-[192em] items-center justify-between px-[2.6em] lg:px-[3.2em]">
          {/* Logo — il porte son propre nom, pas de wordmark à côté. */}
          <Logo className="h-[7em] w-auto shrink-0" />

          {/* Navigation */}
          <nav className="hidden items-center gap-[2.6em] lg:flex">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={item}
                href="#"
                className="relative pb-[0.7em] text-[1.4em] font-medium transition-colors hover:text-black"
                style={{ color: i === 0 ? GOLD : '#4B5563' }}
              >
                {item}
                {i === 0 && (
                  <span
                    className="absolute -bottom-[0.1em] left-0 right-0 h-[0.15em] rounded-full"
                    style={{ backgroundColor: GOLD }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden items-center gap-[1.1em] lg:flex">
            <button className="flex h-[4.4em] w-[4.4em] items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-800">
              <Search className="h-[1.7em] w-[1.7em]" />
            </button>
            {user ? (
              <button
                onClick={onDashboard}
                className="flex items-center gap-[0.8em] rounded-full py-[0.55em] pl-[0.55em] pr-[1.8em] text-[1.35em] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: INK }}
              >
                <span
                  className="flex h-[2em] w-[2em] items-center justify-center rounded-full text-[0.85em] font-bold"
                  style={{ backgroundColor: user.role === 'organizer' ? GOLD : PURPLE }}
                >
                  {user.full_name.slice(0, 1).toUpperCase()}
                </span>
                Mon espace
              </button>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="rounded-full border border-gray-300 px-[2.2em] py-[1.15em] text-[1.35em] font-semibold text-gray-800 transition-colors hover:border-gray-400"
                >
                  Se connecter
                </button>
                <button
                  onClick={onLogin}
                  className="flex items-center gap-[0.7em] rounded-full px-[2.2em] py-[1.15em] text-[1.35em] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: INK }}
                >
                  <User className="h-[1.35em] w-[1.35em]" />
                  S&apos;inscrire
                </button>
              </>
            )}
          </div>

          {/* Menu mobile */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-[0.8em] text-gray-700 lg:hidden">
            {mobileMenuOpen ? <X className="h-[2.4em] w-[2.4em]" /> : <Menu className="h-[2.4em] w-[2.4em]" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white lg:hidden">
            <div className="space-y-[1.2em] px-[2em] py-[1.6em]">
              {NAV_ITEMS.map((item) => (
                <a key={item} href="#" className="block text-[1.5em] font-medium text-gray-700">
                  {item}
                </a>
              ))}
              <div className="flex gap-[1.2em] border-t border-gray-100 pt-[1.6em]">
                {user ? (
                  <button
                    onClick={onDashboard}
                    className="flex-1 rounded-full px-[1.6em] py-[1em] text-[1.4em] font-semibold text-white"
                    style={{ backgroundColor: INK }}
                  >
                    Mon espace
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onLogin}
                      className="flex-1 rounded-full border border-gray-300 px-[1.6em] py-[1em] text-[1.4em] font-semibold text-gray-700"
                    >
                      Se connecter
                    </button>
                    <button
                      onClick={onLogin}
                      className="flex-1 rounded-full px-[1.6em] py-[1em] text-[1.4em] font-semibold text-white"
                      style={{ backgroundColor: INK }}
                    >
                      S&apos;inscrire
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ====================== CORPS — une seule vue ====================== */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* ============================== HERO ============================= */}
        <section className="relative flex min-h-0 flex-1 items-center overflow-hidden bg-white">
          {/* Visuel — plein cadre à droite, fondu vers le blanc */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[65%]">
            <img
              src={chessHeroImage}
              alt="Échiquier et pièces"
              className="h-full w-full object-cover object-[center_46%]"
              style={{
                maskImage:
                  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,0.85) 38%, #000 52%)',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,0.85) 38%, #000 52%)',
              }}
            />
            {/* Halo doré + fondu bas vers le blanc */}
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(circle at 62% 40%, ${GOLD}22 0%, transparent 58%)` }}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-[28%]"
              style={{ background: 'linear-gradient(to top, #fff 6%, rgba(255,255,255,0) 20%)' }}
            />
          </div>

          {/* Texte */}
          <div className="relative z-10 mx-auto flex w-full max-w-[192em] items-center px-[2.6em] lg:px-[6em]">
            <div className="max-w-[62em]">

              <h1 className="mt-[0.55em] text-[5.4em] font-extrabold leading-[1.03] tracking-[-0.025em]">
                LÀ OÙ LA STRATÉGIE
                <br />
                <span style={{ color: GOLD }}>CRÉE LA LÉGENDE</span>
              </h1>

              <p className="mt-[2.2em] max-w-[52em] text-[1.6em] leading-[1.6] text-gray-500">
                VIPP Digital Services est la plateforme dédiée aux passionnés d&apos;échecs. Participez, suivez et vibrez
                au rythme des plus grandes compétitions.
              </p>

              <div className="mt-[2.6em] flex flex-wrap gap-[1.4em]">
                <button
                  className="flex items-center gap-[0.8em] rounded-full px-[2.4em] py-[1.25em] text-[1.3em] font-bold tracking-[0.06em] text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: INK }}
                >
                  <ChessKnightIcon className="h-[1.5em] w-[1.5em]" />
                  DÉCOUVRIR LES TOURNOIS
                </button>
                <button className="flex items-center gap-[0.8em] rounded-full border border-gray-300 px-[2.4em] py-[1.25em] text-[1.3em] font-bold tracking-[0.06em] text-gray-800 transition-colors hover:border-gray-400">
                  <Trophy className="h-[1.5em] w-[1.5em]" style={{ color: GOLD }} />
                  VOIR LE CALENDRIER
                </button>
              </div>

              {/* Statistiques */}
              <div className="mt-[3.4em] flex items-center">
                <StatItem icon={<Users className="h-[2.4em] w-[2.4em]" />} value="1K+" label="JOUEURS" />
                <Divider />
                <StatItem icon={<Trophy className="h-[2.4em] w-[2.4em]" />} value="25+" label="TOURNOIS" />
                <Divider />
                <StatItem icon={<Globe2 className="h-[2.4em] w-[2.4em]" />} value="12" label="PAYS" />
                <Divider />
                <StatItem
                  icon={<Calendar className="h-[2.4em] w-[2.4em]" />}
                  value="À VENIR"
                  label="DE GRANDES ÉDITIONS"
                />
              </div>
            </div>
          </div>

          {/* Carte « événement phare » */}
          {featured && (
            <div className="absolute right-[3.6em] top-1/2 z-20 hidden w-[25em] -translate-y-1/2 rounded-[1.6em] border border-black/5 bg-white p-[2em] text-center shadow-[0_2.4em_5em_-1.6em_rgba(17,17,20,0.35)] lg:block">
              <span
                className="inline-block rounded-full px-[1.2em] py-[0.5em] text-[1.05em] font-bold tracking-[0.1em] text-white"
                style={{ backgroundColor: GOLD }}
              >
                ÉVÉNEMENT PHARE
              </span>

              <Trophy className="mx-auto mt-[1.6em] h-[3.4em] w-[3.4em]" style={{ color: GOLD }} strokeWidth={1.6} />

              <h3 className="mt-[1em] text-[2em] font-extrabold leading-[1.15] tracking-[-0.01em]">
                <SplitTitle name={featured.name} />
              </h3>

              <span
                className="mt-[1.1em] inline-block rounded-full px-[1.2em] py-[0.45em] text-[1.05em] font-bold tracking-[0.08em] text-white"
                style={{ backgroundColor: PURPLE }}
              >
                SAISON 1
              </span>

              <div className="mt-[1.4em] space-y-[0.8em] text-left text-[1.2em] text-gray-600">
                {featured.start_date && (
                  <div className="flex items-center gap-[0.8em]">
                    <Calendar className="h-[1.35em] w-[1.35em] shrink-0" style={{ color: GOLD }} />
                    <span>{formatDate(featured.start_date)}</span>
                  </div>
                )}
                <div className="flex items-center gap-[0.8em]">
                  <MapPin className="h-[1.35em] w-[1.35em] shrink-0" style={{ color: GOLD }} />
                  <span>
                    {(featured.location ?? 'À définir').toUpperCase()} — {featured.total_rounds} RONDES
                  </span>
                </div>
              </div>

              <button
                onClick={() => onTournamentClick(featured.id)}
                className="mt-[1.8em] flex w-full items-center justify-center gap-[0.7em] rounded-full py-[1.15em] text-[1.15em] font-bold tracking-[0.08em] text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: INK }}
              >
                EN SAVOIR PLUS
                <ArrowRight className="h-[1.3em] w-[1.3em]" />
              </button>

              <div className="mt-[1.4em] flex justify-center gap-[0.6em]">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-[0.6em] w-[0.6em] rounded-full"
                    style={{ backgroundColor: i === 0 ? INK : '#D8D8DC' }}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ======================= PROCHAINS TOURNOIS ======================= */}
        <section className="flex-none px-[2.6em] lg:px-[3.2em]">
          <div className="relative mx-auto max-w-[192em] rounded-[1.6em] border border-black/5 bg-[#FBFAF9] px-[2em] py-[1.6em]">
            <div className="mb-[1.4em] flex items-center justify-between">
              <h2 className="flex items-center gap-[0.4em] text-[1.7em] font-extrabold tracking-[-0.01em]">
                <ChevronRight className="h-[1.1em] w-[1.1em]" style={{ color: GOLD }} strokeWidth={3} />
                PROCHAINS TOURNOIS
              </h2>
              <a
                href="#"
                className="flex items-center gap-[0.5em] text-[1.15em] font-semibold tracking-[0.06em] text-gray-500 transition-colors hover:text-gray-800"
              >
                VOIR TOUS LES TOURNOIS
                <ArrowRight className="h-[1.2em] w-[1.2em]" />
              </a>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-[1.4em] sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-[13.5em] rounded-[1.2em]" />
                ))}
              </div>
            ) : upcoming.length > 0 ? (
              <div className="grid grid-cols-1 gap-[1.4em] sm:grid-cols-2 lg:grid-cols-4">
                {upcoming.map((tournament, i) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    crop={THUMB_CROPS[i % THUMB_CROPS.length]}
                    onClick={() => onTournamentClick(tournament.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-[13.5em] items-center justify-center text-[1.4em] text-gray-400">
                Aucun tournoi à venir pour le moment
              </div>
            )}

            {/* Flèche « suivant » */}
            <button
              className="absolute right-[-1.7em] top-[64%] hidden h-[3.4em] w-[3.4em] items-center justify-center rounded-full text-white shadow-[0_1em_2em_-0.6em_rgba(17,17,20,0.6)] transition-transform hover:scale-105 lg:flex"
              style={{ backgroundColor: INK }}
              aria-label="Tournois suivants"
            >
              <ChevronRight className="h-[1.6em] w-[1.6em]" />
            </button>
          </div>
        </section>

        {/* =========================== TROIS ACCÈS ========================== */}
        <section className="flex-none px-[2.6em] pt-[1.6em] lg:px-[3.2em]">
          <div className="mx-auto grid max-w-[192em] grid-cols-1 gap-[1.6em] md:grid-cols-3">
            <InfoCard
              iconBg={PURPLE}
              icon={<User className="h-[1.9em] w-[1.9em] text-white" />}
              title="POUR LES JOUEURS"
              description="Inscrivez-vous aux tournois, suivez vos parties, améliorez votre classement et défiez des joueurs du monde entier."
              linkText={user ? 'MON ESPACE JOUEUR' : 'CRÉER UN COMPTE'}
              onClick={user ? onDashboard : onLogin}
              accent={PURPLE}
            />
            <InfoCard
              iconBg={GOLD}
              icon={<Trophy className="h-[1.9em] w-[1.9em] text-white" />}
              title="POUR LES ORGANISATEURS"
              description="Créez et gérez vos compétitions facilement. Notre plateforme s'occupe du reste."
              /* Pas d'inscription publique vers ce rôle : on renvoie
                 simplement vers la connexion. */
              linkText={user?.role === 'organizer' ? 'CRÉER UNE COMPÉTITION' : 'ESPACE ORGANISATEUR'}
              onClick={user?.role === 'organizer' ? onDashboard : onLogin}
              accent={GOLD_DARK}
            />
            <InfoCard
              iconBg={INK}
              icon={<BarsIcon className="h-[1.9em] w-[1.9em] text-white" />}
              title="CLASSEMENTS EN TEMPS RÉEL"
              description="Suivez l'évolution des tournois et des joueurs en direct avec des statistiques détaillées."
              linkText="VOIR LES CLASSEMENTS"
              accent={INK}
            />
          </div>
        </section>

        {/* ============================ PARTENAIRES ========================= */}
        <footer className="mt-[1.6em] flex-none border-t border-black/5 px-[2.6em] lg:px-[3.2em]">
          <div className="mx-auto flex h-[6em] max-w-[192em] items-center justify-between gap-[2em]">
            <p className="whitespace-nowrap text-[1.05em] font-bold tracking-[0.2em] text-gray-400">
              NOS PARTENAIRES
            </p>
            <div className="hidden flex-1 items-center justify-center gap-[3.4em] md:flex">
              {['Chess.com', 'Lichess.org', 'DGT', 'ChessBase', 'Académie des Échecs'].map((name) => (
                <span
                  key={name}
                  className="whitespace-nowrap text-[1.4em] font-bold text-gray-400 transition-colors hover:text-gray-600"
                >
                  {name}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-[0.6em]">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-[3em] w-[3em] items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-800"
                >
                  <Icon className="h-[1.5em] w-[1.5em]" />
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Briques                                                            */
/* ------------------------------------------------------------------ */

function Divider() {
  return <div className="mx-[1.6em] h-[3.2em] w-px bg-gray-200" />;
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-[1em]">
      <div className="shrink-0" style={{ color: GOLD }}>
        {icon}
      </div>
      <div className="leading-none">
        <div className="text-[1.9em] font-extrabold tracking-[-0.02em]">{value}</div>
        <div className="mt-[0.5em] text-[1.05em] font-semibold tracking-[0.08em] text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function SplitTitle({ name }: { name: string }) {
  const [first, ...rest] = name.trim().split(' ');
  return (
    <>
      <span className="block">{first.toUpperCase()}</span>
      {rest.length > 0 && (
        <span className="block" style={{ color: GOLD }}>
          {rest.join(' ').toUpperCase()}
        </span>
      )}
    </>
  );
}

function statusBadge(status: Tournament['status']) {
  switch (status) {
    case 'registration':
      return { label: 'INSCRIPTIONS OUVERTES', color: GREEN };
    case 'in_progress':
      return { label: 'EN COURS', color: GOLD_DARK };
    case 'completed':
      return { label: 'TERMINÉ', color: '#6B7280' };
    default:
      return { label: 'À VENIR', color: PURPLE };
  }
}

function formatDate(value: string) {
  return new Date(value)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    .toUpperCase();
}

function TournamentCard({
  tournament,
  crop,
  onClick,
}: {
  tournament: Tournament;
  crop: string;
  onClick: () => void;
}) {
  const badge = statusBadge(tournament.status);

  return (
    <button
      onClick={onClick}
      className="group flex overflow-hidden rounded-[1.2em] border border-black/5 bg-white text-left shadow-[0_0.6em_1.6em_-1.2em_rgba(17,17,20,0.4)] transition-shadow hover:shadow-[0_1.4em_2.8em_-1.4em_rgba(17,17,20,0.45)]"
    >
      <img
        src={chessHeroImage}
        alt=""
        aria-hidden="true"
        className="h-auto w-[8.4em] shrink-0 self-stretch object-cover"
        style={{ objectPosition: crop }}
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between p-[1.2em]">
        <div className="min-w-0">
          <span
            className="inline-block rounded-full px-[0.9em] py-[0.35em] text-[0.95em] font-bold tracking-[0.06em] text-white"
            style={{ backgroundColor: badge.color }}
          >
            {badge.label}
          </span>
          <h3 className="mt-[0.9em] truncate text-[1.4em] font-extrabold tracking-[-0.01em]">{tournament.name}</h3>
          {tournament.start_date && (
            <p className="mt-[0.7em] text-[1.1em] text-gray-500">{formatDate(tournament.start_date)}</p>
          )}
        </div>

        <div className="mt-[0.9em] flex items-end justify-between gap-[0.8em]">
          <div className="flex min-w-0 items-center gap-[0.5em] text-[1.05em] text-gray-500">
            <MapPin className="h-[1.2em] w-[1.2em] shrink-0" style={{ color: GOLD }} />
            <span className="truncate">
              {(tournament.location ?? 'À définir').toUpperCase()} — {tournament.total_rounds} RONDES
            </span>
          </div>
          <span className="flex h-[3em] w-[3em] shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-800 transition-transform group-hover:translate-x-[0.15em]">
            <ArrowRight className="h-[1.4em] w-[1.4em]" />
          </span>
        </div>
      </div>
    </button>
  );
}

function InfoCard({
  iconBg,
  icon,
  title,
  description,
  linkText,
  accent,
  onClick,
}: {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  accent: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex gap-[1.6em] rounded-[1.4em] border border-black/5 bg-white p-[1.8em] shadow-[0_0.6em_1.6em_-1.4em_rgba(17,17,20,0.35)]">
      <div
        className="flex h-[4.6em] w-[4.6em] shrink-0 items-center justify-center rounded-[1.1em]"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-[1.5em] font-extrabold tracking-[0.01em]">{title}</h3>
        <p className="mt-[0.8em] text-[1.2em] leading-[1.45] text-gray-500">{description}</p>
        <button
          type="button"
          onClick={onClick}
          className="mt-[1em] inline-flex items-center gap-[0.5em] text-[1.1em] font-bold tracking-[0.06em] transition-opacity hover:opacity-70"
          style={{ color: accent }}
        >
          {linkText}
          <ArrowRight className="h-[1.2em] w-[1.2em]" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icônes maison                                                      */
/* ------------------------------------------------------------------ */

function ChessKnightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path
        d="M7 22h11l-1-3H9.5L9 16h6c1.5-3.5.5-7-2-9-1.6-1.3-2.5-2.5-2.5-4.5C8 4 6 6 6 9c0 1.8 1 2.7 2 3.5-1.3.3-3 1.5-3 4.5v2l-1 1v2h3Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BarsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M5 20V12M12 20V6M19 20v-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
