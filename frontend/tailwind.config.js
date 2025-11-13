/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00ffff',
        dark: '#081b29',
        secondary: '#00cccc',
         accent: '#00ffff',
        'cyan-400': '#00ffff',
        'cyan-600': '#00cccc',
        'navy': '#081b29',
        gradient: {
          navy: '#081b29',
          cyan: '#00ffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [],
};
