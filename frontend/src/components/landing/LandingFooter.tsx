import { Target, Users, Scale, Shield, HeartHandshake, ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { INK, GOLD } from './tokens';

/* Les valeurs de VIPP Digital Services — la colonne vertébrale du club,
   affichée en pied de chaque page publique. */
const VALUES: { label: string; Icon: LucideIcon }[] = [
  { label: 'RESPONSABILITÉ', Icon: Target },
  { label: 'ÉGALITÉ', Icon: Users },
  { label: 'ÉQUITÉ', Icon: Scale },
  { label: 'LOYAUTÉ', Icon: Shield },
  { label: 'HONNÊTETÉ', Icon: HeartHandshake },
];

/* Où aiguiser son jeu entre deux tournois. */
const TRAINING = [
  { name: 'Chess.com', href: 'https://www.chess.com' },
  { name: 'Lichess.org', href: 'https://lichess.org' },
];

export function LandingFooter() {
  return (
    <footer className="flex-none bg-white dark:bg-gradient-to-t dark:from-[#342752] dark:to-[#251C3A]">
      <div className="mx-auto pt-10 flex max-w-[192em] flex-wrap items-center justify-between gap-x-[3em] gap-y-[1.6em] px-[2.6em] py-[1.6em] lg:px-[3.2em]">
        <div>
          <span className="whitespace-nowrap text-[1.5em] font-bold tracking-[0.2em] text-gray-400 dark:text-[#CBB9D8]">
            Nos valeurs:
          </span>
        </div>

        {/* Valeurs */}
        <div className="flex flex-1 items-center justify-center gap-[2.6em] sm:justify-start">
          {VALUES.map(({ label, Icon }) => (
            <div key={label} className="flex items-center gap-[0.7em]">
              <Icon
                className="h-[2em] w-[2em] shrink-0 text-[#C6963B] dark:text-[#F2B96B]"
                strokeWidth={1.6}
              />
              <span className="whitespace-nowrap text-[1.15em] font-extrabold tracking-[0.12em] text-[#111114] dark:text-[#F8EFE7]">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Entraînement */}
        <div className="flex items-center gap-[1.8em]">
          <span className="whitespace-nowrap text-[1.05em] font-bold tracking-[0.2em] text-gray-400 dark:text-[#CBB9D8]">
            S&apos;ENTRAÎNER SUR
          </span>
          {TRAINING.map(({ name, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-[0.5em] whitespace-nowrap text-[1.4em] font-bold transition-opacity hover:opacity-80 text-[#111114] dark:text-[#F8EFE7]"
            >
              {name}
              <ExternalLink
                className="h-[1.1em] w-[1.1em] opacity-40 transition-opacity group-hover:opacity-100 text-[#C6963B] dark:text-[#F2B96B]"
              />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
