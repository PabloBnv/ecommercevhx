/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'andino-beige': '#f9f6e5',
        'andino-green': '#77da96',
        'andino-dark-green': '#5ab87a',
        'andino-brown': '#3e2723',
        'andino-dark': '#1a120f',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    },
  },
  plugins: [],
}
