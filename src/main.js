import './assets/main.css'
// ─── Firebase Setup ────────────────────────────────────────────────
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import FirebaseService from './services/firebaseService.js'

const firebaseConfig = {
  apiKey: 'AIzaSyAxafUmq6EOwlCrZLXVcHDV5S7Vu7ngSAg',
  authDomain: 'xgym-5047b.firebaseapp.com',
  projectId: 'xgym-5047b',
  storageBucket: 'xgym-5047b.firebasestorage.app',
  messagingSenderId: '342530982524',
  appId: '1:342530982524:web:3622b8ba91010338a27ff9'
}

// Initialise Firebase only once (safe to call multiple times)
const appFb = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Optional: Analytics (only works in browser environments)
try {
  getAnalytics(appFb)
} catch {
  /* Analytics may fail (e.g., server-side render); ignore */
}

// Initialise our service wrapper (uses the same app instance)
FirebaseService.init(firebaseConfig)
// ───────────────────────────────────────────────────────────────────
import { createApp } from 'vue'
import App from './App'
import router from './router'
import messages from './i18n/messages.js'

// Simple global i18n function
window.$t = function (key, lang = window.currentLang || 'en') {
  return messages[lang]?.[key] || key
}

// Set default language
window.currentLang = 'en'

createApp(App).use(router).mount('#app')
