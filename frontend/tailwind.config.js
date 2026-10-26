/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotel: {
          navy: '#0B132B',
          navyLight: '#1C2541',
          slate: '#3A506B',
          gold: '#C5A059',
          goldLight: '#E5C287',
          goldDark: '#99732B',
          cream: '#FBF9F5',
          creamDark: '#F3EFE6',
          sand: '#ECE5D8',
          charcoal: '#1A1D20',
          muted: '#6C757D',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(11, 19, 43, 0.08), 0 0 1px 1px rgba(11, 19, 43, 0.04)',
        'luxury-hover': '0 25px 50px -12px rgba(11, 19, 43, 0.15), 0 0 1px 1px rgba(197, 160, 89, 0.2)',
        'gold-glow': '0 0 25px rgba(197, 160, 89, 0.25)',
      }
    },
  },
  plugins: [],
}
