/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4CAF50', // Green
          DEFAULT: '#4CAF50',
          dark: '#388E3C',
        },
        secondary: {
          light: '#2196F3', // Blue
          DEFAULT: '#2196F3',
          dark: '#1976D2',
        },
        accent: {
          light: '#FF9800', // Orange
          DEFAULT: '#FF9800',
          dark: '#F57C00',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}; 