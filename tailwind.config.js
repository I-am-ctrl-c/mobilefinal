/* eslint-disable no-undef */
/* eslint-env node */
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
      './index.html',
      './src/**/*.{vue,js,ts,jsx,tsx,html}',
    ],
    theme: {
      extend: {
        colors: {
          darkBg: '#222332',
          primaryPurple: '#9662F1',
          lightBg: '#F5F6FA',
          darkText: '#1A1A1A',

          // Expose CSS variable palettes so we can use e.g. text-font-5
          ...(() => {
            const out = {}
            const types = ['font', 'bg', 'decorPu', 'decorBl', 'contrast']
            for (const t of types) {
              for (let i = 1; i <= 10; i++) {
                out[`${t}-${i}`] = `var(--${t}-${i})`
              }
            }
            return out
          })()
        },
        fontFamily: {
          ledger: ['"Ledger"', 'serif'],
          antic: ['"Antic Didone"', 'serif'],
          noto: ['"Noto Sans"', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }

