/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0F0F10',
          800: '#1A1A1A',
          700: '#242425',
          600: '#2F2F31',
          500: '#3D3D40',
          400: '#6B6B70',
          300: '#9A9AA0',
          200: '#C9C9CF',
          100: '#EFEFF2',
        },
        amber: {
          DEFAULT: '#E8843A',
          50: '#FCEEE2',
          100: '#F8D7B7',
          200: '#F2B783',
          300: '#ED9A57',
          400: '#E8843A',
          500: '#D26C24',
          600: '#A8551B',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', '"Nunito"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(232,132,58,0.35)',
      },
      keyframes: {
        burst: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        burst: 'burst 500ms ease-out',
        fadeIn: 'fadeIn 300ms ease-out',
      },
    },
  },
  plugins: [],
};
