import daisyui from 'daisyui'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans Thai', 'sans-serif'],
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
        artshop: {
          primary:   '#7c3aed',   // violet-700
          secondary: '#db2777',   // pink-600
          accent:    '#f59e0b',   // amber-500
          neutral:   '#1e1b4b',
          'base-100':'#ffffff',
          info:      '#0ea5e9',
          success:   '#10b981',
          warning:   '#f59e0b',
          error:     '#ef4444',
        },
      },
      'light',
      'dark',
    ],
    defaultTheme: 'artshop',
  },
}
