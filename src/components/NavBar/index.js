import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router' // 添加 useRouter
import navTemplate from './navbar.html?raw'
import './navbar.css'
import logoDark from '../../assets/images/xgymlogo.png'
import logoLight from '../../assets/images/xgymlogo_b.png'
import messages from '../../i18n/messages.js'
import FirebaseService from '../../services/firebaseService.js'

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

    // Reactive user info – will be populated from Firestore (if logged in)
    const user = reactive({
      name: '',
      avatar: 'https://i.pravatar.cc/32'
    })

    // Load current user from Firestore using localStorage userId
    const loadUser = async () => {
      const uid = localStorage.getItem('userId')
      if (!uid) {
        user.name = 'Guest'
        return
      }
      try {
        const service = FirebaseService.getInstance()
        const userData = await service.getUser(uid)
        user.name = userData.name || 'User'
        // Optionally use avatar from Firestore if available later
      } catch (err) {
        console.error('[NavBar] Failed to fetch user data', err)
      }
    }

    // 点击头像 / 用户名：已登录跳转 Profile，否则跳转 Login
    const handleUserClick = () => {
      const uid = localStorage.getItem('userId')
      if (uid) {
        router.push('/profile')
      } else {
        router.push('/login')
      }
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
      loadUser()
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
      handleUserClick // 暴露方法以供模板使用
    }
  }
}
