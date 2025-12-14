/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-bg': '#F5F5F7',
        'apple-text': '#1D1D1F',
        'apple-text-secondary': '#86868B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'sans-serif'],
      },
      boxShadow: {
        'apple': '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'apple-hover': '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'apple': '1.5rem',
        'apple-lg': '2rem',
      },
    },
  },
  plugins: [],
}

