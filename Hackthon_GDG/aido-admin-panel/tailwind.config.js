/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aido: {
          green: '#16A34A',
          darkGreen: '#166534',
          bg: '#F8FAFC',
          text: '#172033',
          muted: '#64748B',
          border: '#E2E8F0',
        },
      },
    },
  },
  plugins: [],
};