import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // 生产环境禁用开发工具
    process.env.NODE_ENV === 'development' && vueDevTools(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除 console 和 debugger
        drop_console: true,
        drop_debugger: true,
        // 移除无用代码
        dead_code: true,
        // 简化 if 语句
        conditionals: true,
        // 内联函数调用
        inline: 2,
        // 移除无法访问的代码
        unused: true,
        // 计算常量表达式
        evaluate: true,
        // 折叠常量
        collapse_vars: true,
        // 合并连续的 var/const/let 声明
        join_vars: true,
        // 移除空语句
        side_effects: false,
      },
      mangle: {
        // 混淆所有标识符
        toplevel: true,
        // 混淆 eval 中的变量名
        eval: true,
        // 保留类名（可选）
        keep_classnames: false,
        // 保留函数名（可选）
        keep_fnames: false,
        // 混淆属性名
        properties: {
          // 只混淆私有属性（以 _ 开头）
          regex: /^_/,
        },
      },
      format: {
        // 移除注释
        comments: false,
        // 美化输出（设为 false 使代码更难读）
        beautify: false,
        // 保留空格
        keep_quoted_props: false,
      },
    },
    rollupOptions: {
      output: {
        // 自定义文件名，使用随机哈希
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 手动分包 - 把 Firebase 相关代码单独打包
        manualChunks: {
          // Firebase 相关
          'firebase-core': ['firebase/app'],
          'firebase-auth': ['firebase/auth'],
          'firebase-firestore': ['firebase/firestore'],
          // Vue 框架
          'vue-vendor': ['vue'],
          // 第三方库
          'vendor': ['chart.js'],
        },
      },
    },
    // 生成 sourcemap（生产环境可以设为 false）
    sourcemap: false,
    // 代码分割阈值
    chunkSizeWarningLimit: 1000,
  },
  // 定义全局变量替换
  define: {
    // 移除开发时的警告
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
})
