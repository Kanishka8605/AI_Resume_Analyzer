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
        dark: {
          bg: '#0F172A',     // Slate 900
          card: '#1E293B',   // Slate 800
          border: '#334155', // Slate 700
          text: '#F8FAFC'    // Slate 50
        },
        primary: {
          DEFAULT: '#6366F1', // Indigo 500
          hover: '#4F46E5',   // Indigo 600
          light: '#818CF8'    // Indigo 400
        },
        accent: {
          green: '#10B981', // Emerald 500
          red: '#EF4444',   // Rose 500
          orange: '#F59E0B' // Amber 500
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
