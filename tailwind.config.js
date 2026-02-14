/** @type {import('tailwindcss').Config} */
export default {
  /*
   * 🍅 Tomato Pastel — Tailwind Config
   *
   * In Tailwind v4 the primary source-of-truth is CSS:
   *   • Design tokens  → src/styles/global.css   (CSS custom properties)
   *   • Theme mapping  → src/styles/index.css     (@theme + @custom-variant)
   *
   * This JS config is kept for editor tooling, plugins, and as a
   * reference for the colour system. Activate it by adding
   *   @config "../../tailwind.config.js";
   * to your main CSS entry-point if needed.
   */
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--tp-bg)',
        surface:    'var(--tp-surface)',
        primary: {
          DEFAULT: 'var(--tp-primary)',
          hover:   'var(--tp-primary-hover)',
          light:   'var(--tp-primary-light)',
        },
        foreground: 'var(--tp-foreground)',
        muted:      'var(--tp-muted)',
        border:     'var(--tp-border)',
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
