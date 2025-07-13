import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import navTemplate from './navbar.html?raw'
import './navbar.css'

export default {
  name: 'NavBarComponent',
  template: navTemplate,
  setup() {
    const isScrolled = ref(false)
    const route = useRoute()

    const navItems = [
      { label: 'Home', path: '/home' },
      { label: 'Schedule', path: '/schedule' },
      { label: 'Booking', path: '/booking' },
      { label: 'Workout', path: '/workout' },
      { label: 'Profile', path: '/profile' }
    ]

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 10
    }

    const isActive = (path) => route.path === path

    onMounted(() => window.addEventListener('scroll', handleScroll))
    onUnmounted(() => window.removeEventListener('scroll', handleScroll))

    return { isScrolled, navItems, isActive }
  }
} 