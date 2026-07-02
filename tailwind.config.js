/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        jua: ['Jua', 'sans-serif'],
        pixel: ['NeoDunggeunmo', 'monospace'],
      },
      colors: {
        cockpit: {
          mint: '#c8f3e6',
          sky: '#a9ddfb',
          purple: '#d9c9f7',
          pink: '#ffc2dd',
          yellow: '#ffe58a',
        },
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        twinkle: 'twinkle 2.4s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
