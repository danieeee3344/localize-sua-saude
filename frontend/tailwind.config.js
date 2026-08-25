/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0051bb',
          dk: '#003a8a',
        },
        accent: {
          DEFAULT: '#00bb38',
          dk: '#007d24',
        },
        purple: '#7d8aff',
        appbg: '#f0f4ff',
        muted: '#4a5568',
        borderc: '#d1d9e6',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
