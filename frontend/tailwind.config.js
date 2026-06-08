/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        base: 'var(--color-base)',
        surface: 'var(--color-surface)',
        content: {
          DEFAULT: 'var(--color-content)',
          muted: 'var(--color-content-muted)'
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          content: 'var(--color-primary-content)'
        },
        error: 'var(--color-error)',
        success: 'var(--color-success)'
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
