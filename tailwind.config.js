// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './index.html',
      './src/**/*.{vue,js,ts,jsx,tsx,html}',
    ],
    theme: {
      extend: {
        colors: {
          darkBg: '#222332',         // 深色背景
          primaryPurple: '#9662F1',  // 自定义紫色
        },
      },
    },
    plugins: [],
  }
  
  