import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette HomeEase — reprise fidèlement de la maquette
        ink: '#12241C', // noir/gris très sombre à dominante verte, pour le texte et le header profil
        surface: '#FFFFFF',
        muted: '#F4F6F5',
        border: '#E6EAE8',
        primary: {
          DEFAULT: '#1E7A4C', // vert doux, couleur d'accent
          dark: '#155C39',
          light: '#E8F4EE',
        },
        accentGold: '#E7A94B', // pour les badges "vérifié" / notes
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
export default config;
