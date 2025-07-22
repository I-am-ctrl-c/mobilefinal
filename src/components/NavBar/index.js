import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import navTemplate from './navbar.html?raw'
import './navbar.css'
import logoDark from '../../assets/images/xgymlogo.png'
import logoLight from '../../assets/images/xgymlogo_b.png'
import defaultAvatar from '../../assets/images/default-avatar.jpg'
import messages from '../../i18n/messages.js'
import FirebaseService from '../../services/firebaseService.js'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: 'NavBarComponent',
  template: navTemplate,
  setup() {
    const isScrolled = ref(false)
    const route = useRoute()
    const router = useRouter()

    const navItems = [
      { key: 'home', path: '/home' },
      { key: 'schedule', path: '/schedule' },
      { key: 'booking', path: '/booking' },
      { key: 'workout', path: '/workout' },
      { key: 'map', path: '/map'},  
      { key: 'profile', path: '/profile' }
    ]

    const savedLang = localStorage.getItem('language') || 'en'
    const language = ref(savedLang)
    window.currentLang = savedLang

    const t = (key) => {
      return messages[language.value]?.[key] || key
    }

    const isDarkMode = ref(
      localStorage.getItem('darkMode') === 'true' ||
      document.documentElement.classList.contains('dark')
    )
    const logoUrl = computed(() => (isDarkMode.value ? logoDark : logoLight))

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
      const root = document.documentElement
      root.classList.toggle('dark', isDarkMode.value)
      localStorage.setItem('darkMode', isDarkMode.value)
    }

    const toggleLanguage = () => {
      language.value = language.value === 'en' ? 'zh' : 'en'
      window.currentLang = language.value
      localStorage.setItem('language', language.value)
      window.dispatchEvent(new Event('languagechange'))
    }

    const controlsMenuOpen = ref(false)
    const toggleControlsMenu = () => {
      controlsMenuOpen.value = !controlsMenuOpen.value
    }

    const user = reactive({
      name: '',
      avatar: defaultAvatar
    })

    const loadUser = async () => {
      const uid = localStorage.getItem('userId')
      if (!uid) {
        user.name = 'Guest'
        user.avatar = defaultAvatar
        return
      }
      try {
        const service = FirebaseService.getInstance()
        const userDoc = doc(service.db, 'users', uid)
        const userSnap = await getDoc(userDoc)

        if (userSnap.exists()) {
          const userData = userSnap.data()
          user.name = userData.name || 'User'
          user.avatar = userData.avatar || defaultAvatar
          console.log('[NavBar] loaded avatar:', user.avatar)
        }
      } catch (err) {
        console.error('[NavBar] Failed to fetch user data', err)
      }
    }

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
      const root = document.documentElement
      root.classList.toggle('dark', isDarkMode.value)

      window.addEventListener('scroll', handleScroll)
      loadUser()

      // ✅ 监听头像更新事件
      window.addEventListener('user-avatar-updated', (e) => {
        const newAvatar = e.detail?.avatar
        if (newAvatar) {
          user.avatar = newAvatar
          console.log('[NavBar] updated avatar via event:', newAvatar)
        }
      })
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('user-avatar-updated', loadUser)
    })

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
      handleUserClick
    }
  }
}
