/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#22c55e', // green-500
        'primary-dark': '#16a34a', // green-600
        secondary: '#64748b', // slate-500
        background: '#f1f5f9', // slate-100
        'surface': '#ffffff',
        'on-surface': '#1e293b', // slate-800
        'on-surface-secondary': '#475569', // slate-600
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}