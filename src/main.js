import './assets/main.css'
// ─── Firebase Setup ────────────────────────────────────────────────
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import FirebaseService from './services/firebaseService.js'
import firebaseConfig from './firebaseConfig.local.js'

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

// Set default language (persisted)
window.currentLang = localStorage.getItem('language') || 'en'

// Set global current user ID (if logged in) for easy access across modules
window.currentUserId = localStorage.getItem('userId') || null

createApp(App).use(router).mount('#app')
