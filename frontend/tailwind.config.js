/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f172a',
          raised: '#1e293b',
          overlay: '#334155',
        },
        border: {
          DEFAULT: 'rgba(148,163,184,0.08)',
          subtle: 'rgba(148,163,184,0.05)',
          strong: 'rgba(148,163,184,0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        /* Display : condensé, emprunté aux bulletins de tournoi imprimés. */
        display: ['Barlow Condensed', 'Inter', 'system-ui', 'sans-serif'],
        /* Toute donnée chiffrée passe en mono : scores, Elo, ½, échiquiers. */
        mono: ['Geist Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139,92,246,0.15), transparent)',
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease forwards',
        'shimmer': 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
