import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import navTemplate from './navbar.html?raw'
import './navbar.css'
import logoUrl from '../../assets/images/xgymlogo.png'
import messages from '../../i18n/messages.js'

export default {
  name: 'NavBarComponent',
  template: navTemplate,
  setup() {
    const isScrolled = ref(false)
    const route = useRoute()

    const navItems = [
      { key: 'home', path: '/home' },
      { key: 'schedule', path: '/schedule' },
      { key: 'booking', path: '/booking' },
      { key: 'workout', path: '/workout' },
      { key: 'profile', path: '/profile' }
    ]

    // translation helper
    const t = (key) => {
      const lang = language.value
      return messages[lang]?.[key] || key
    }

    // Dark mode state
    const isDarkMode = ref(false)
    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
      const root = document.documentElement
      if (isDarkMode.value) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    // Language state
    const language = ref('en')
    const toggleLanguage = () => {
      language.value = language.value === 'en' ? 'zh' : 'en'
      window.currentLang = language.value
      // force update (for demo, in real app use a reactive i18n plugin)
      window.dispatchEvent(new Event('languagechange'))
    }

    // Small screen controls dropdown
    const controlsMenuOpen = ref(false)
    const toggleControlsMenu = () => {
      controlsMenuOpen.value = !controlsMenuOpen.value
    }

    // Placeholder user info
    const user = {
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/32'
    }

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 10
    }

    const isActive = (path) => route.path === path

    onMounted(() => window.addEventListener('scroll', handleScroll))
    onUnmounted(() => window.removeEventListener('scroll', handleScroll))

    return { logoUrl, isScrolled, navItems, isActive, isDarkMode, toggleDarkMode, language, toggleLanguage, user, controlsMenuOpen, toggleControlsMenu, t }
  }
} 