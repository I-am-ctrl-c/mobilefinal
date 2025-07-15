import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router' // 添加 useRouter
import navTemplate from './navbar.html?raw'
import './navbar.css'
import logoDark from '../../assets/images/xgymlogo.png'
import logoLight from '../../assets/images/xgymlogo_b.png'
import messages from '../../i18n/messages.js'

export default {
  name: 'NavBarComponent',
  template: navTemplate,
  setup() {
    const isScrolled = ref(false)
    const route = useRoute()
    const router = useRouter() // 获取 router 实例

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

    // Dark mode state (persisted)
    const isDarkMode = ref(
      localStorage.getItem('darkMode') === 'true' ||
        document.documentElement.classList.contains('dark')
    )
    // Dynamic logo based on theme
    const logoUrl = computed(() => (isDarkMode.value ? logoDark : logoLight))

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
      const root = document.documentElement
      if (isDarkMode.value) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      localStorage.setItem('darkMode', isDarkMode.value)
    }

    // Language state (persisted globally)
    const savedLang = localStorage.getItem('language') || 'en'
    const language = ref(savedLang)
    // Ensure global var matches on init
    window.currentLang = savedLang
    const toggleLanguage = () => {
      language.value = language.value === 'en' ? 'zh' : 'en'
      window.currentLang = language.value
      localStorage.setItem('language', language.value)
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

    //  新增：点击头像跳转到登录页面
    const goToLogin = () => {
      router.push('/auth')
    }

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 10
    }

    const isActive = (path) => route.path === path

    onMounted(() => {
      // ensure root class matches stored value on mount
      const root = document.documentElement
      if (isDarkMode.value) root.classList.add('dark')
      else root.classList.remove('dark')
      window.addEventListener('scroll', handleScroll)
    })
    onUnmounted(() => window.removeEventListener('scroll', handleScroll))

    return {
      logoUrl,
      isScrolled,
      navItems,
      isActive,
      isDarkMode,
      toggleDarkMode,
      language,
      toggleLanguage,
      user,
      controlsMenuOpen,
      toggleControlsMenu,
      t,
      goToLogin // 暴露方法以供模板使用
    }
  }
}
