import homeTemplate from './home.html?raw'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'HomePage',
  components: { NavBar, Footer },
  template: homeTemplate,
  setup() {
    const router = useRouter()

    const currentSlide = ref(0)
    const totalSlides = 3
    let slideInterval = null

    const nextSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % totalSlides
    }

    const previousSlide = () => {
      currentSlide.value = currentSlide.value === 0 ? totalSlides - 1 : currentSlide.value - 1
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

    const goToBooking = () => {
      router.push('/booking')
    }

    const goToProfile = () => {
      router.push('/profile')
    }

    const goToVideo = (type) => {
      const videoLinks = {
        arm: 'https://firebasestorage.googleapis.com/v0/b/xgym-5047b.firebasestorage.app/o/videos%2FworkoutVideo%2Farm.mp4?alt=media&token=03bea673-f5fd-43fc-9de9-423351d7124c',
        leg: 'https://your-link-for-leg.mp4',
        back: 'https://your-link-for-back.mp4',
        chest: 'https://your-link-for-chest.mp4'
      }
      router.push({ path: '/video-player', query: { url: videoLinks[type] } })
    }


    onMounted(() => {
      startAutoSlide()
    })

    onUnmounted(() => {
      stopAutoSlide()
    })

    return {
      currentSlide,
      nextSlide,
      previousSlide,
      goToBooking,
      goToProfile,
      goToVideo
    }
  }
}
