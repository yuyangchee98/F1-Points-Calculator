/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // F1 team colors
        'mercedes': '#00D2BE',
        'redbull': '#0600EF',
        'ferrari': '#DC0000',
        'mclaren': '#FF8700',
        'astonmartin': '#006F62',
        'alpine': '#0090FF',
        'sauber': '#C00000',
        'racingbulls': '#2B4562',
        'williams': '#005AFF',
        'haas': '#E6002B',
      },
    },
  },
  plugins: [],
}