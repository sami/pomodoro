/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff6b6b', // Pastel Red / Tomato
          hover: '#fa5252',
          light: '#ff8787',
        },
        cream: '#fdfbf7',
        surface: {
          light: '#ffffff',
          dark: '#1a1b1e',
        },
        text: {
          light: '#2c2e33',
          dark: '#e9ecef'
        }
      },
      fontFamily: {
        sans: ['Quicksand', 'Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
