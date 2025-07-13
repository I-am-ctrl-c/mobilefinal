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
          darkBg: '#222332',         // 深色背景
          primaryPurple: '#9662F1',  // 自定义紫色
          lightBg: '#F5F6FA',        // 浅色背景
          darkText: '#1A1A1A'        // 浅色模式文字
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
  
  