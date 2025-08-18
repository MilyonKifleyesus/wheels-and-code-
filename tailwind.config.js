/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'matte-black': '#0B0B0C',
        'carbon-gray': '#141518',
        'dark-graphite': '#1A1B1E',
        'acid-yellow': '#D7FF00',
        'neon-lime': '#C8FF1A',
        'soft-white': '#F2F4F5',
        'electric-blue': '#39FF14',
        'neon-green': '#39FF14'
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