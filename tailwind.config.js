/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#060a0a',
          800: '#0d1313',
          700: '#161e1e',
          600: '#233030',
        },
        primary: {
          400: '#33ffb3',
          500: '#00ff9d',
          600: '#00cc7d',
        },
        muted: {
          DEFAULT: '#8b9d9d',
          subtle: '#546666',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
