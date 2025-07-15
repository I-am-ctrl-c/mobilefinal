import template from './upgrade.html?raw'
import upgradeMessages from '../../i18n/upgrade.js'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import { ref, onMounted } from 'vue'

export default {
  name: 'Upgrade',
  components: { NavBar, Footer },
  template,
  setup() {
    const lang = ref('en')

    const t = (key) => upgradeMessages[lang.value]?.[key] || key

    onMounted(() => {
      window.addEventListener('languagechange', () => {
        lang.value = window.currentLang || 'en'
      })
    })

    return { t }
  }
}
