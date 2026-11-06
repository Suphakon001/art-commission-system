import daisyui from 'daisyui'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Thai"', 'sans-serif'],
      },
      colors: {
        lavender: {
          50: '#faf8ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(109, 40, 217, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(109, 40, 217, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [
    daisyui,
    typography,
  ],
  daisyui: {
    themes: [
      {
        artspace: {
          primary: '#6d28d9',            // Rich Lavender Purple
          'primary-content': '#ffffff',
          secondary: '#ede9fe',          // Pale lavender background pill
          'secondary-content': '#5b21b6',
          accent: '#7c3aed',
          'accent-content': '#ffffff',
          neutral: '#1e1b4b',
          'neutral-content': '#ffffff',
          'base-100': '#ffffff',         // Pure White Cards
          'base-200': '#f8f7fd',         // Soft Lavender Canvas
          'base-300': '#ede9fe',         // Lavender border lines
          'base-content': '#1f2937',
          info: '#38bdf8',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          '--rounded-box': '1.25rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '9999px',
        },
      },
      'light',
    ],
    defaultTheme: 'artspace',
  },
}
