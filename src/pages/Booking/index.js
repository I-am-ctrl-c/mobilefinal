import bookingTemplate from './booking.html?raw'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'
import messages from '../../i18n/bookingMessages.js'
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'BookingPage',
  components: { NavBar, Footer },
  template: bookingTemplate,
  setup() {
    const language = ref(window.currentLang || 'en')

    const t = (key) => {
      return messages[language.value]?.[key] || key
    }

    const handleLangChange = () => {
      language.value = window.currentLang
    }

    onMounted(() => window.addEventListener('languagechange', handleLangChange))
    onUnmounted(() => window.removeEventListener('languagechange', handleLangChange))

    return { t }
  }
}
