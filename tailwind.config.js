/** @type {import('tailwindcss').Config} */

// Design tokens live in src/index.css as CSS custom properties (:root).
// Values here reference those variables so a future dark theme only needs
// to flip the CSS variables, not touch any component classes.
// NOTE: Team colors are defined in the API (metadata.ts) as single source of
// truth and applied via inline styles at runtime — never tokenized here.

const rgb = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  content: [
    "./src/**/*.{astro,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: rgb('--brand'),
          strong: rgb('--brand-strong'),
          subtle: rgb('--brand-subtle'),
        },
        carbon: {
          50: rgb('--carbon-50'),
          100: rgb('--carbon-100'),
          200: rgb('--carbon-200'),
          300: rgb('--carbon-300'),
          400: rgb('--carbon-400'),
          500: rgb('--carbon-500'),
          600: rgb('--carbon-600'),
          700: rgb('--carbon-700'),
          800: rgb('--carbon-800'),
          900: rgb('--carbon-900'),
        },
        surface: {
          DEFAULT: rgb('--surface'),
          sunken: rgb('--surface-sunken'),
          inverse: rgb('--surface-inverse'),
        },
        ink: {
          DEFAULT: rgb('--text-primary'),
          secondary: rgb('--text-secondary'),
          muted: rgb('--text-muted'),
        },
        interactive: rgb('--interactive'),
        success: rgb('--success'),
        warning: rgb('--warning'),
        danger: rgb('--danger'),
      },
      borderColor: {
        DEFAULT: `rgb(var(--border) / 1)`,
        strong: rgb('--border-strong'),
      },
      fontFamily: {
        display: ['Archivo', 'Archivo-fallback', 'system-ui', 'sans-serif'],
      },
      // Major third (1.25) scale, base 16px, with paired line-heights
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.35' }], // 11px — micro-labels, badges
        xs: ['0.75rem', { lineHeight: '1.4' }],       // 12px — card metadata
        sm: ['0.875rem', { lineHeight: '1.45' }],     // 14px — default UI text
        base: ['1rem', { lineHeight: '1.5' }],        // 16px — body prose
        lg: ['1.25rem', { lineHeight: '1.4' }],       // 20px — section headings
        xl: ['1.5625rem', { lineHeight: '1.3' }],     // 25px — panel titles
        '2xl': ['1.953rem', { lineHeight: '1.25' }],  // 31px — page H1
        '3xl': ['2.441rem', { lineHeight: '1.15' }],  // 39px — hero only
      },
      // Elevation = "lifted off the board": xs for resting cards, lg for
      // dragged cards / modals. Anything between is popovers and menus.
      boxShadow: {
        xs: '0 1px 2px rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px rgb(0 0 0 / 0.08)',
        md: '0 4px 12px rgb(0 0 0 / 0.10)',
        lg: '0 12px 32px rgb(0 0 0 / 0.16)',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '10px',
      },
      zIndex: {
        sticky: '10',
        header: '20',
        overlay: '30',
        nav: '40',
        modal: '50',
        toast: '60',
      },
    },
  },
  plugins: [],
}
