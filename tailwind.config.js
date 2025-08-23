/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-textSecondary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',

        // Backwards compatibility
        'matte-black': 'var(--color-background)',
        'carbon-gray': '#141518', // No direct mapping yet
        'dark-graphite': 'var(--color-surface)',
        'acid-yellow': 'var(--color-primary)',
        'neon-lime': 'var(--color-secondary)',
        'soft-white': 'var(--color-text)',
        'electric-blue': 'var(--color-accent)',
        'neon-green': 'var(--color-accent)',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'grid-flow': 'grid-flow 20s linear infinite',
      },
      keyframes: {
        'grid-flow': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(90deg, rgba(215,255,0,0.1) 1px, transparent 1px), linear-gradient(rgba(215,255,0,0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-pattern': '20px 20px',
      }
    },
  },
  plugins: [],
}