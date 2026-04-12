/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefcfa',
          100: '#cff7f1',
          200: '#a0efe5',
          300: '#5edfcc',
          400: '#22c4ad',
          500: '#0fa791',
          600: '#0d8678',
          700: '#106d64',
          800: '#125750',
          900: '#124943',
        },
      },
      boxShadow: {
        soft: '0 12px 30px -18px rgba(16, 109, 100, 0.5)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 450ms ease-out both',
      },
    },
  },
  plugins: [],
};
