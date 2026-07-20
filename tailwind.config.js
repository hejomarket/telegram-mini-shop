/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { soia: { green: '#123b2a', forest: '#092319', leaf: '#1d6b4b', lime: '#c8f169', cream: '#f8f3e7', mist: '#eef3e7', sand: '#e6d2ad' } },
      boxShadow: { card: '0 18px 60px rgba(18,59,42,.10)', soft: '0 10px 30px rgba(18,59,42,.10)' }
    }
  },
  plugins: []
};
