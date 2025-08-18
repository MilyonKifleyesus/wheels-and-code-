/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Automotive brand colors
        'matte-black': '#0B0B0C',
        'carbon-gray': '#1A1A1B',
        'dark-graphite': '#2D2D30',
        'steel-gray': '#4A4A4F',
        'silver-metallic': '#C0C0C5',
        'chrome-white': '#F8F8FF',
        
        // Accent colors
        'acid-yellow': '#D7FF00',
        'neon-lime': '#CCFF00',
        'electric-blue': '#0066FF',
        'racing-red': '#FF3333',
        
        // Enhanced visibility colors
        'emergency-red': {
          500: '#FF3333',
          600: '#CC0000',
        },
        'electric-cyan': {
          400: '#00CCFF',
          500: '#0099CC',
        },
        'purple-electric': {
          500: '#6600FF',
          600: '#5200CC',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Orbitron', 'monospace'],
      },
      animation: {
        'grid-flow': 'grid-flow 20s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'rotate-pulse': 'rotate-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'grid-flow': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%': { 
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
            transform: 'scale(1)',
          },
          '100%': { 
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
            transform: 'scale(1.05)',
          },
        },
        'rotate-pulse': {
          '0%, 100%': { 
            transform: 'rotate(0deg) scale(1)',
            opacity: '1',
          },
          '50%': { 
            transform: 'rotate(180deg) scale(1.1)',
            opacity: '0.8',
          },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%), linear-gradient(transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%)',
      },
      backgroundSize: {
        'grid-pattern': '50px 50px',
      },
    },
  },
  plugins: [],
}