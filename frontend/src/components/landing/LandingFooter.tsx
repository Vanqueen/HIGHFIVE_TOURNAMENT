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
    <footer className="flex-none overflow-hidden bg-white dark:bg-gradient-to-t dark:from-[#342752] dark:to-[#251C3A]">
      <div className="mx-auto flex flex-row justify-between gap-4 px-6 py-4 lg-py-6 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-5">

        {/* Valeurs */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-[#CBB9D8]">
            Nos valeurs
          </span>
          <div className="flex flex-col gap-x-3 gap-y-2 lg-gap-x-5">
            {VALUES.map(({ label, Icon }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 shrink-0 text-[#C6963B] dark:text-[#F2B96B]" strokeWidth={1.6} />
                <span className="text-xs font-extrabold tracking-[0.1em] text-[#111114] dark:text-[#F8EFE7]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Entraînement */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-[#CBB9D8]">
            S&apos;entraîner sur
          </span>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {TRAINING.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 text-sm font-bold text-[#111114] transition-opacity hover:opacity-70 dark:text-[#F8EFE7]"
              >
                {name}
                <ExternalLink className="h-3.5 w-3.5 opacity-40 transition-opacity group-hover:opacity-100 text-[#C6963B] dark:text-[#F2B96B]" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
