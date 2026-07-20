import { useState } from 'react';
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
  Crown,
  Globe2,
  ArrowRight,
  ChevronRight,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useTournaments } from '../hooks/useTournaments';
import type { Tournament } from '../types';
import chessHeroImage from '../assets/image.png';

/* ------------------------------------------------------------------ */
/*  Design tokens — pulled from the reference mock                     */
/*  ink   : near-black text / primary buttons                          */
/*  gold  : brand accent (crown, headline, icons, "open" states)       */
/*  purple: "season / upcoming" badge accent                           */
/*  green : "registration open" badge accent                           */
/* ------------------------------------------------------------------ */
const INK = '#111114';
const GOLD = '#C6963B';
const GOLD_DARK = '#A87A2C';
const PURPLE = '#5B3E96';
const GREEN = '#1E9E5A';

const CARD_VARIANTS = [
  { badge: 'INSCRIPTIONS OUVERTES', badgeColor: GREEN, art: GOLD, piece: 'king' as const },
  { badge: 'À VENIR', badgeColor: PURPLE, art: INK, piece: 'knight' as const },
  { badge: 'À VENIR', badgeColor: PURPLE, art: GOLD_DARK, piece: 'rook' as const },
  { badge: 'À VENIR', badgeColor: PURPLE, art: INK, piece: 'pawn' as const },
];

export function LandingPage({
  onLogin,
  onTournamentClick,
}: {
  onLogin: () => void;
  onTournamentClick: (id: string) => void;
}) {
  const { tournaments, loading } = useTournaments();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const featuredTournament = tournaments.length > 0 ? tournaments[0] : null;
  const upcomingTournaments = tournaments.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* ============================= HEADER ============================= */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-20 mx-auto max-w-[1920px]">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <Crown className="w-8 h-8 shrink-0" style={{ color: GOLD }} strokeWidth={1.75} />
              <div className="leading-tight">
                <div className="text-lg sm:text-xl font-extrabold tracking-tight" style={{ color: INK }}>
                  VIPP INTERSTIS
                </div>
                <div className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: GOLD }}>
                  L&apos;EXCELLENCE AUX ÉCHECS
                </div>
              </div>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {['Accueil', 'Tournois', 'Compétitions', 'Classements', 'Joueurs', 'Actualités', 'À propos'].map(
                (item, i) => (
                  <a
                    key={item}
                    href="#"
                    className="relative pb-1 text-sm font-medium transition-colors"
                    style={{ color: i === 0 ? INK : '#4B5563' }}
                  >
                    {item}
                    {i === 0 && (
                      <span
                        className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full"
                        style={{ backgroundColor: GOLD }}
                      />
                    )}
                  </a>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={onLogin}
                className="px-5 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-800 hover:border-gray-400 transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={onLogin}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: INK }}
              >
                <UserPlus className="w-4 h-4" />
                S&apos;inscrire
              </button>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-700">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-3">
              {['Accueil', 'Tournois', 'Compétitions', 'Classements', 'Joueurs', 'Actualités', 'À propos'].map(
                (item) => (
                  <a key={item} href="#" className="block text-gray-700 font-medium">
                    {item}
                  </a>
                )
              )}
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={onLogin}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-full font-semibold text-sm"
                >
                  Se connecter
                </button>
                <button
                  onClick={onLogin}
                  className="flex-1 px-4 py-2 text-white rounded-full font-semibold text-sm"
                  style={{ backgroundColor: INK }}
                >
                  S&apos;inscrire
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ============================== HERO =============================== */}
      <section className="pt-16 pb-20 bg-white relative overflow-hidden">
        <div className="w-full pl-24">
          <div className="mx-auto max-w-[1920px]">
            {/* Copy */}
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]" style={{ color: INK }}>
                LÀ OÙ LA STRATÉGIE
                <br />
                <span style={{ color: GOLD }}>CRÉE LA LÉGENDE</span>
              </h1>

              <p className="mt-6 text-lg text-gray-500 max-w-xl">
                VIPP Interstis est la plateforme dédiée aux passionnés d&apos;échecs. Participez, suivez et
                vibrez au rythme des plus grandes compétitions.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <button
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white text-sm font-bold tracking-wide transition-opacity hover:opacity-90"
                  style={{ backgroundColor: INK }}
                >
                  <ChessKnightIcon className="w-4 h-4" />
                  DÉCOUVRIR LES TOURNOIS
                </button>
                <button
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-gray-300 text-sm font-bold tracking-wide text-gray-800 hover:border-gray-400 transition-colors"
                >
                  <Trophy className="w-4 h-4" style={{ color: GOLD }} />
                  VOIR LE CALENDRIER
                </button>
              </div>

              {/* Stats */}
              <div className="mt-14 flex flex-wrap max-w-xl">
                <StatItem icon={<Users className="w-6 h-6" />} value="1K+" label="JOUEURS" />
                <div className="w-px h-8 bg-gray-200 mx-4" />
                <StatItem icon={<Trophy className="w-6 h-6" />} value="25+" label="TOURNOIS" />
                <div className="w-px h-8 bg-gray-200 mx-4" />
                <StatItem icon={<Globe2 className="w-6 h-6" />} value="12" label="PAYS" />
                <div className="w-px h-8 bg-gray-200 mx-4" />
                <StatItem icon={<Calendar className="w-6 h-6" />} value="À VENIR" label="GRANDES ÉDITIONS" />
              </div>
            </div>

            {/* Hero art - natural integration without block effect */}
            <div className="absolute top-0 right-0 w-full lg:w-[75%] xl:w-[70%] h-[120%] -translate-y-[10%] pointer-events-none">
              <div className="relative h-full">
                {/* Image */}
                <img 
                  src={chessHeroImage} 
                  alt="Échiquier avec pièces" 
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ 
                    maskImage: 'linear-gradient(to left, black 20%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.3) 50%, transparent 70%)',
                    WebkitMaskImage: 'linear-gradient(to left, black 20%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.3) 50%, transparent 70%)'
                  }}
                />
                
                {/* Subtle gradient overlay for depth */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 25%, rgba(255,255,255,0.2) 45%, transparent 65%)'
                  }}
                />
                
                {/* radial gold glow overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 70% 45%, ${GOLD}25 0%, transparent 60%)` }}
                />

                {/* Floating featured card */}
                {featuredTournament && (
                  <div className="absolute bottom-12 right-12 lg:right-16 w-[280px] sm:w-[300px] bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 z-30 pointer-events-auto">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide text-white mb-4"
                      style={{ backgroundColor: GOLD }}
                    >
                      ÉVÉNEMENT PHARE
                    </span>
                    <Trophy className="w-8 h-8 mb-3" style={{ color: GOLD }} />
                    <h3 className="font-extrabold text-lg leading-snug" style={{ color: INK }}>
                      {featuredTournament.name}
                    </h3>
                    <span
                      className="inline-block mt-2 mb-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: PURPLE }}
                    >
                      SAISON 1
                    </span>
                    <div className="space-y-2 text-sm text-gray-600">
                      {featuredTournament.start_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                          <span>
                            {new Date(featuredTournament.start_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      {featuredTournament.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                          <span>{featuredTournament.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                        <span>{featuredTournament.total_rounds} rondes</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onTournamentClick(featuredTournament.id)}
                      className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-bold tracking-wide hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: INK }}
                    >
                      EN SAVOIR PLUS
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex justify-center gap-1.5 mt-4">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: INK }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= PROCHAINS TOURNOIS ======================= */}
      <section className="pt-16 pb-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-[1920px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold" style={{ color: INK }}>
                <ChevronRight className="w-6 h-6" style={{ color: GOLD }} />
                PROCHAINS TOURNOIS
              </h2>
              <a
                href="#"
                className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                VOIR TOUS LES TOURNOIS
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div
                  className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: GOLD, borderTopColor: 'transparent' }}
                />
              </div>
            ) : upcomingTournaments.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {upcomingTournaments.map((tournament, i) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    variant={CARD_VARIANTS[i % CARD_VARIANTS.length]}
                    onClick={() => onTournamentClick(tournament.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">Aucun tournoi à venir pour le moment</div>
            )}
          </div>
        </div>
      </section>

      {/* ============================ INFO CARDS ============================ */}
      <section className="py-16 bg-[#FAF9F6]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid md:grid-cols-3 gap-6 mx-auto max-w-[1920px]">
            <InfoCard
              iconBg={PURPLE}
              icon={<Users className="w-5 h-5 text-white" />}
              title="POUR LES JOUEURS"
              description="Inscrivez-vous aux tournois, suivez vos parties, améliorez votre classement et défiez des joueurs du monde entier."
              linkText="CRÉER UN COMPTE"
              accent={PURPLE}
            />
            <InfoCard
              iconBg={GOLD}
              icon={<Trophy className="w-5 h-5 text-white" />}
              title="POUR LES ORGANISATEURS"
              description="Créez et gérez vos compétitions facilement grâce à nos outils professionnels d'appariement et de suivi."
              linkText="CRÉER UNE COMPÉTITION"
              accent={GOLD_DARK}
            />
            <InfoCard
              iconBg={INK}
              icon={<BarsIcon className="w-5 h-5 text-white" />}
              title="CLASSEMENTS EN TEMPS RÉEL"
              description="Suivez l'évolution des tournois et des joueurs en direct grâce à des statistiques détaillées."
              linkText="VOIR LES CLASSEMENTS"
              accent={INK}
            />
          </div>
        </div>
      </section>

      {/* ============================= PARTNERS ============================= */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-[1920px] flex flex-col lg:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold tracking-[0.2em] text-gray-400 whitespace-nowrap">NOS PARTENAIRES</p>
            <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
              <PartnerLogo name="Chess.com" />
              <PartnerLogo name="Lichess.org" />
              <PartnerLogo name="DGT" />
              <PartnerLogo name="ChessBase" />
              <PartnerLogo name="Académie des Échecs" />
            </div>
            <div className="flex gap-2">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = INK)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================== FOOTER =============================== */}
      <footer className="text-white py-10" style={{ backgroundColor: INK }}>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mx-auto max-w-[1920px]">
            <div className="flex items-center gap-2.5">
              <Crown className="w-6 h-6" style={{ color: GOLD }} strokeWidth={1.75} />
              <span className="text-lg font-extrabold">VIPP INTERSTIS</span>
            </div>
            <p className="text-sm text-gray-400">© 2026 VIPP INTERSTIS. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0" style={{ color: GOLD }}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-extrabold leading-tight" style={{ color: INK }}>
          {value}
        </div>
        <div className="text-[11px] font-semibold tracking-wide text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function TournamentCard({
  tournament,
  variant,
  onClick,
}: {
  tournament: Tournament;
  variant: { badge: string; badgeColor: string; art: string; piece: 'king' | 'knight' | 'rook' | 'pawn' };
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow text-left border border-gray-100 overflow-hidden"
    >
      <div className="relative h-36" style={{ backgroundColor: variant.art }}>
        <CheckerPattern />
        <div className="absolute inset-0 flex items-center justify-center">
          <ChessPieceIcon piece={variant.piece} className="w-16 h-16 text-white/90" />
        </div>
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: variant.badgeColor }}
        >
          {variant.badge}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-extrabold mb-2.5 leading-snug" style={{ color: INK }}>
          {tournament.name}
        </h3>
        {tournament.start_date && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
            <Calendar className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span>
              {new Date(tournament.start_date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
        {tournament.location && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span>{tournament.location}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Trophy className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span>{tournament.total_rounds} rondes</span>
          </div>
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5"
            style={{ backgroundColor: INK }}
          >
            <ArrowRight className="w-3.5 h-3.5" />
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
}: {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <h3 className="font-extrabold mb-3 tracking-wide text-sm" style={{ color: INK }}>
        {title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-5">{description}</p>
      <a
        href="#"
        className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide"
        style={{ color: accent }}
      >
        {linkText}
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

function PartnerLogo({ name }: { name: string }) {
  return (
    <div className="text-gray-400 font-bold text-base sm:text-lg hover:text-gray-600 transition-colors whitespace-nowrap">
      {name}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Generated art — inline SVG so the page has no broken image links   */
/* ------------------------------------------------------------------ */

function HeroArt() {
  return (
    <div className="relative rounded-3xl overflow-hidden min-h-[440px] flex items-center justify-center">
      <img 
        src={chessHeroImage} 
        alt="Échiquier avec pièces" 
        className="w-full h-full object-cover"
      />
      {/* radial gold glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 65% 40%, ${GOLD}33 0%, transparent 55%)` }}
      />
    </div>
  );
}

function CheckerPattern({ opacity = 0.12, size = 24 }: { opacity?: number; size?: number }) {
  const id = `checker-${size}`;
  return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <rect width={size} height={size} fill="transparent" />
          <rect width={size / 2} height={size / 2} fill="white" opacity={opacity} />
          <rect x={size / 2} y={size / 2} width={size / 2} height={size / 2} fill="white" opacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function ChessPieceIcon({
  piece,
  className,
  style,
}: {
  piece: 'king' | 'knight' | 'rook' | 'pawn';
  className?: string;
  style?: React.CSSProperties;
}) {
  const common = { className, style, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 };
  switch (piece) {
    case 'king':
      return (
        <svg {...common}>
          <path
            d="M12 2v3M10.5 3.5h3M7 22h10l-1-6H8l-1 6ZM6 16h12l-1.2-4.5c1.4-.6 2.2-2 2.2-3.5a4 4 0 0 0-6-3.46A4 4 0 0 0 7 8c0 1.5.8 2.9 2.2 3.5L8 16Z"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'knight':
      return (
        <svg {...common}>
          <path
            d="M7 22h11l-1-3H9.5L9 16h6c1.5-3.5.5-7-2-9-1.6-1.3-2.5-2.5-2.5-4.5C8 4 6 6 6 9c0 1.8 1 2.7 2 3.5-1.3.3-3 1.5-3 4.5v2l-1 1v2h3Z"
            strokeLinejoin="round"
          />
          <circle cx="9.3" cy="6.6" r=".6" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'rook':
      return (
        <svg {...common}>
          <path
            d="M7 22h10l-.7-5H7.7L7 22ZM8 17h8l-.5-6H8.5L8 17ZM7 11V4h2v2h2V4h2v2h2V4h2v7H7Z"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'pawn':
      return (
        <svg {...common}>
          <path
            d="M8.5 22h7l-.8-4H9.3l-.8 4ZM9 18h6l-.7-3.3c1-.5 1.7-1.6 1.7-2.7a3 3 0 0 0-2-2.8 2.6 2.6 0 1 0-3.9-2.2c0 .5.15 1 .4 1.4a3 3 0 0 0-1.7 4.6c-.6.4-1 1.1-1 1.8L9 18Z"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

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