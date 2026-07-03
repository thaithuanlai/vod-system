/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#E50914',
          hover:   '#ff0a16',
          dim:     'rgba(229,9,20,0.15)',
        },
        dark: {
          primary:   '#0a0a0a',
          secondary: '#111111',
          card:      '#161616',
          hover:     '#1c1c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':    '0 4px 24px rgba(0,0,0,0.4)',
        'hover':   '0 8px 40px rgba(0,0,0,0.6)',
        'accent':  '0 4px 20px rgba(229,9,20,0.3)',
      },
    },
  },
  plugins: [],
}
