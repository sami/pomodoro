/** @type {import('tailwindcss').Config} */
export default {
  /*
   * Warm Minimal — Tailwind Config
   *
   * In Tailwind v4 the primary source-of-truth is CSS:
   *   • Design tokens  → src/index.css   (CSS custom properties)
   *   • Theme mapping  → src/index.css   (@theme + @custom-variant)
   */
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-color)',
        backgroundDark: 'var(--bg-dark)',
        primary: 'var(--primary)',
        textMain: 'var(--text-main)',
      },
      fontFamily: {
        sans: ['Nunito', 'Quicksand', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1.5rem',
      },
    },
  },
  plugins: [],
}
