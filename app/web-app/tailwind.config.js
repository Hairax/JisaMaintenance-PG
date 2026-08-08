/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // La estrategia de dark mode se define en src/index.css con
  // @custom-variant (Tailwind v4 ya no lee `darkMode` desde este archivo).
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9E5533',
          light: '#E1CD9B',
          dark: '#3C2729',
        },
        background: {
          light: '#FFFFFF',
          dark: '#0F090C',
        },
        text: {
          light: '#000000',
          dark: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
