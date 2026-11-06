import daisyui from 'daisyui'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Thai"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Noto Sans Thai"', 'sans-serif'],
      },
      colors: {
        gallery: {
          950: '#06090e',
          900: '#0b0f19',
          800: '#111827',
          700: '#1e293b',
          600: '#334155',
          gold: '#f59e0b',
          'gold-light': '#fbbf24',
        },
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
        artgallery: {
          primary: '#f59e0b',            // Warm amber gold
          'primary-content': '#090d16',
          secondary: '#334155',          // Refined slate
          'secondary-content': '#f8fafc',
          accent: '#e2e8f0',
          'accent-content': '#090d16',
          neutral: '#06090e',            // Studio obsidian
          'neutral-content': '#f8fafc',
          'base-100': '#0b0f19',         // Deep gallery canvas
          'base-200': '#111827',         // Card surface
          'base-300': '#1e293b',         // Border lines
          'base-content': '#f1f5f9',     // Crisp text
          info: '#38bdf8',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#f43f5e',
          '--rounded-box': '1rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '9999px',
        },
      },
      'dark',
    ],
    defaultTheme: 'artgallery',
    darkTheme: 'artgallery',
  },
}
