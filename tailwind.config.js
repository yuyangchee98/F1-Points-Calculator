/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NOTE: Team colors are defined in the API (metadata.ts) as single source of truth
        // These are only kept for potential future use with Tailwind utility classes
      },
    },
  },
  plugins: [],
}