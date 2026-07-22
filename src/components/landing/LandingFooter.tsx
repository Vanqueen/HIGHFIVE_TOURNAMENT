import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const PARTNERS = ['Chess.com', 'Lichess.org', 'DGT', 'ChessBase', 'Académie des Échecs'];
const SOCIALS = [Facebook, Twitter, Instagram, Youtube];

export function LandingFooter() {
  return (
    <footer className="mt-[1.6em] flex-none border-t border-black/5 px-[2.6em] lg:px-[3.2em]">
      <div className="mx-auto flex h-[6em] max-w-[192em] items-center justify-between gap-[2em]">
        <p className="whitespace-nowrap text-[1.05em] font-bold tracking-[0.2em] text-gray-400">
          NOS PARTENAIRES
        </p>
        <div className="hidden flex-1 items-center justify-center gap-[3.4em] md:flex">
          {PARTNERS.map((name) => (
            <span
              key={name}
              className="whitespace-nowrap text-[1.4em] font-bold text-gray-400 transition-colors hover:text-gray-600"
            >
              {name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-[0.6em]">
          {SOCIALS.map((Icon, i) => (
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
  );
}
