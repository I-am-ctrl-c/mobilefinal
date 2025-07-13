import './assets/main.css'
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