import homeTemplate from './home.html?raw'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import homeMessages from '../../i18n/home.js'

export default {
  name: 'HomePage',
  components: { NavBar, Footer },
  template: homeTemplate,
  setup() {
    const router = useRouter()
    const lang = ref('en')
    
    // 翻译函数
    const t = (key) => homeMessages[lang.value]?.[key] || key

    // Hero Slider State
    const currentSlide = ref(0)
    const totalSlides = 3
    let slideInterval = null
    const isTransitioning = ref(false)

    // Animation State
    const scrollObserver = ref(null)
    const visibleElements = ref(new Set())

    // Hero Slider Methods
    const nextSlide = () => {
      if (isTransitioning.value) return
      isTransitioning.value = true
      
      currentSlide.value = (currentSlide.value + 1) % totalSlides
      
      setTimeout(() => {
        isTransitioning.value = false
      }, 700)
    }

    const previousSlide = () => {
      if (isTransitioning.value) return
      isTransitioning.value = true
      
      currentSlide.value = currentSlide.value === 0 ? totalSlides - 1 : currentSlide.value - 1
      
      setTimeout(() => {
        isTransitioning.value = false
      }, 700)
    }

    const goToSlide = (index) => {
      if (isTransitioning.value || index === currentSlide.value) return
      isTransitioning.value = true
      
      currentSlide.value = index
      
      setTimeout(() => {
        isTransitioning.value = false
      }, 700)
    }

    const startAutoSlide = () => {
      slideInterval = setInterval(nextSlide, 5000)
    }

    const stopAutoSlide = () => {
      if (slideInterval) {
        clearInterval(slideInterval)
        slideInterval = null
      }
    }

    // Scroll Animation Methods
    const initScrollAnimations = () => {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
      }

      scrollObserver.value = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            visibleElements.value.add(entry.target)
          } else {
            entry.target.classList.remove('visible')
            visibleElements.value.delete(entry.target)
          }
        })
      }, observerOptions)

      // Observe all scroll animation elements
      const elements = document.querySelectorAll('.scroll-fade, .scroll-slide-left, .scroll-slide-right')
      elements.forEach(el => scrollObserver.value.observe(el))
    }

    // Navigation Methods
    const goToBooking = () => {
      router.push('/booking')
    }

    const goToProfile = () => {
      router.push('/profile')
    }

    const goToVideo = (type) => {
      const videoLinks = {
        arm: 'https://firebasestorage.googleapis.com/v0/b/xgym-5047b.firebasestorage.app/o/videos%2FworkoutVideo%2Farm.mp4?alt=media&token=03bea673-f5fd-43fc-9de9-423351d7124c',
        leg: 'https://firebasestorage.googleapis.com/v0/b/xgym-5047b.firebasestorage.app/o/videos%2FworkoutVideo%2Fleg1.mp4?alt=media&token=1f1b865b-e72c-4f22-b9cf-b98a49603c11',
        back: 'https://firebasestorage.googleapis.com/v0/b/xgym-5047b.firebasestorage.app/o/videos%2FworkoutVideo%2Fback.mp4?alt=media&token=35a93818-fe55-4c79-93bc-79944cbc0e86',
        chest: 'https://firebasestorage.googleapis.com/v0/b/xgym-5047b.firebasestorage.app/o/videos%2FworkoutVideo%2Fabs.mp4?alt=media&token=27de820d-c2f7-477f-8a5b-9157fe478bde'
      }
      
      if (videoLinks[type]) {
        router.push({ 
          path: '/video-player', 
          query: { 
            url: videoLinks[type],
            type: type,
            title: homeMessages[lang.value].videoTitles[type] || 'Workout Video'
          } 
        })
      }
    }

    // Smooth Scrolling
    const scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    }

    // Keyboard Navigation
    const handleKeydown = (event) => {
      if (event.key === 'ArrowLeft') {
        previousSlide()
        stopAutoSlide()
        setTimeout(startAutoSlide, 1000)
      } else if (event.key === 'ArrowRight') {
        nextSlide()
        stopAutoSlide()
        setTimeout(startAutoSlide, 1000)
      } else if (event.key === 'Escape') {
        stopAutoSlide()
      }
    }

    // Touch/Swipe Support
    const touchState = ref({
      startX: 0,
      endX: 0,
      startY: 0,
      endY: 0,
      isActive: false
    })

    const handleTouchStart = (event) => {
      touchState.value.startX = event.touches[0].clientX
      touchState.value.startY = event.touches[0].clientY
      touchState.value.isActive = true
      stopAutoSlide()
    }

    const handleTouchMove = (event) => {
      if (!touchState.value.isActive) return
      touchState.value.endX = event.touches[0].clientX
      touchState.value.endY = event.touches[0].clientY
    }

    const handleTouchEnd = () => {
      if (!touchState.value.isActive) return
      
      const deltaX = touchState.value.endX - touchState.value.startX
      const deltaY = touchState.value.endY - touchState.value.startY
      const minSwipeDistance = 50
      
      // Only process horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          previousSlide()
        } else {
          nextSlide()
        }
      }
      
      touchState.value.isActive = false
      setTimeout(startAutoSlide, 2000)
    }

    // Preload Images
    const preloadImages = () => {
      const imageUrls = [
        '/src/assets/images/hero-1.jpg',
        '/src/assets/images/hero-2.jpg',
        '/src/assets/images/hero-3.jpg',
        '/src/assets/images/home-about.jpg',
        '/src/assets/images/class-1.jpg',
        '/src/assets/images/class-2.jpg',
        '/src/assets/images/class-3.jpg'
      ]
      
      imageUrls.forEach(url => {
        const img = new Image()
        img.src = url
      })
    }

    // Lifecycle Hooks
    onMounted(async () => {
      // 初始化语言设置
      lang.value = window.currentLang || 'en'
      
      // 监听语言变化事件
      window.addEventListener('languagechange', () => {
        lang.value = window.currentLang || 'en'
      })

      await nextTick()
      
      // Initialize features
      preloadImages()
      initScrollAnimations()
      startAutoSlide()
      
      // Add event listeners
      document.addEventListener('keydown', handleKeydown)
      
      // Add touch event listeners to hero section
      const heroSection = document.querySelector('.hero-section')
      if (heroSection) {
        heroSection.addEventListener('touchstart', handleTouchStart, { passive: true })
        heroSection.addEventListener('touchmove', handleTouchMove, { passive: true })
        heroSection.addEventListener('touchend', handleTouchEnd, { passive: true })
      }
      
      // Pause auto-slide on hover
      const heroSlider = document.querySelector('.hero-slider')
      if (heroSlider) {
        heroSlider.addEventListener('mouseenter', stopAutoSlide)
        heroSlider.addEventListener('mouseleave', startAutoSlide)
      }
      
      // Add visibility change listener
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopAutoSlide()
        } else {
          startAutoSlide()
        }
      })
    })

    onUnmounted(() => {
      stopAutoSlide()
      
      // Clean up event listeners
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('visibilitychange', () => {})
      
      // Clean up intersection observer
      if (scrollObserver.value) {
        scrollObserver.value.disconnect()
      }
      
      // Clean up touch events
      const heroSection = document.querySelector('.hero-section')
      if (heroSection) {
        heroSection.removeEventListener('touchstart', handleTouchStart)
        heroSection.removeEventListener('touchmove', handleTouchMove)
        heroSection.removeEventListener('touchend', handleTouchEnd)
      }
    })

    return {
      // State
      currentSlide,
      isTransitioning,
      visibleElements,
      lang,
      
      // Hero Slider Methods
      nextSlide,
      previousSlide,
      goToSlide,
      
      // Navigation Methods
      goToBooking,
      goToProfile,
      goToVideo,
      scrollToSection,
      
      // Touch Methods
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      
      // Translation Function
      t
    }
  }
}