import './schedule.css'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'
import FirebaseService from '../../services/firebaseService'
import scheduleTemplate from './schedule.html?raw'
import scheduleMessages from '../../i18n/schedule.js'
import { ref, onMounted } from 'vue'

export default {
  name: 'SchedulePage',
  components: { NavBar, Footer },
  template: scheduleTemplate,
  setup() {
    const userId = 'test-user' // Replace with real user ID in production
    const bookings = ref([])
    const equipmentMap = ref({})
    const currentPage = ref(1)
    const pageSize = ref(5)
    const lang = ref('en')
    
    // 翻译函数
    const t = (key) => scheduleMessages[lang.value]?.[key] || key

    const loadBookings = async () => {
      const service = FirebaseService.getInstance()
      const allEquipment = await service.loadAllEquipment()
      const map = {}
      allEquipment.forEach(eq => {
        map[eq.id] = eq
      })
      equipmentMap.value = map
      service.streamBookingsByUser(userId, handleBookings)
    }

    const handleBookings = (newBookings) => {
      bookings.value = [...newBookings].sort((a, b) => a.startTime.toDate() - b.startTime.toDate())
    }

    const toggleBookingStatus = async (booking) => {
      const service = FirebaseService.getInstance()
      booking.status = booking.status === 'cancelled' ? 'active' : 'cancelled'
      await service.updateBooking(booking)
    }

    const paginatedBookings = () => {
      const start = (currentPage.value - 1) * pageSize.value
      return bookings.value.slice(start, start + pageSize.value)
    }

    const nextPage = () => {
      if (currentPage.value * pageSize.value < bookings.value.length) {
        currentPage.value++
      }
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const formatDate = (dateObj) => {
      return new Date(dateObj.toDate()).toLocaleString(lang.value === 'zh' ? 'zh-CN' : 'en-US')
    }

    onMounted(async () => {
      // 初始化语言设置
      lang.value = window.currentLang || 'en'
      
      // 监听语言变化事件
      window.addEventListener('languagechange', () => {
        lang.value = window.currentLang || 'en'
      })

      await loadBookings()
    })

    return {
      bookings,
      equipmentMap,
      currentPage,
      pageSize,
      loadBookings,
      handleBookings,
      toggleBookingStatus,
      paginatedBookings,
      nextPage,
      prevPage,
      formatDate,
      t
    }
  }
}