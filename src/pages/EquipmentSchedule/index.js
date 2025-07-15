import template from './equipmentschedule.html?raw'
import './equipmentschedule.css'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FirebaseService from '../../services/firebaseService.js'
import messages from '../../i18n/messages.js'
import bookingMessages from '../../i18n/bookingMessages.js'

export default {
  name: 'EquipmentSchedulePage',
  components: { NavBar, Footer },
  template,
  setup() {
    const route = useRoute()
    const router = useRouter()
    const eqId = route.params.id

    const equipment = ref(null)
    const capacity = ref(0)

    const timeSlots = Array.from({ length: 15 }, (_, i) => 8 + i) // 8:00-22:00 inclusive

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i)
      return {
        date,
        label: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dateLabel: date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
      }
    })

    const bookings = ref([])

    // Selected slot: { slotIndex, dayIndex }
    const selectedSlot = ref(null)

    function selectSlot(slotIndex, dayIndex) {
      selectedSlot.value = { slotIndex, dayIndex }
    }

    function isSelected(slotIndex, dayIndex) {
      return (
        selectedSlot.value &&
        selectedSlot.value.slotIndex === slotIndex &&
        selectedSlot.value.dayIndex === dayIndex
      )
    }

    function confirmBooking() {
      if (!selectedSlot.value) return // ignore if none selected

      const day = days[selectedSlot.value.dayIndex]
      const slotHour = timeSlots[selectedSlot.value.slotIndex]

      // In a full implementation, we'd create a booking or navigate with details
      router.push({
        path: '/booking',
        query: {
          eqId,
          date: day.date.toISOString(),
          hour: slotHour
        }
      })
    }

    function goBack() {
      router.back()
    }

    /** Compute availability matrix: {[dayIndex][slotIndex] = remaining} */
    const availability = computed(() => {
      if (!capacity.value) return []
      const matrix = Array.from({ length: timeSlots.length }, () => Array(days.length).fill(capacity.value))
      bookings.value.forEach(bk => {
        const start = bk.startTime
        const dayIdx = Math.floor((start - days[0].date) / 86400000)
        if (dayIdx < 0 || dayIdx >= days.length) return
        const hour = start.getHours()
        const slotIdx = hour - 8
        if (slotIdx >= 0 && slotIdx < timeSlots.length) {
          matrix[slotIdx][dayIdx] = Math.max(0, matrix[slotIdx][dayIdx] - 1)
        }
      })
      return matrix
    })

    async function loadData() {
      const service = FirebaseService.getInstance()
      equipment.value = await service.getEquipment(eqId)
      capacity.value = equipment.value.available || 0
      // fetch bookings between now and +7d
      service.streamBookingsByEquipment(eqId, list => {
        bookings.value = list.filter(b => b.endTime >= new Date())
      })
    }

    const language = ref(window.currentLang || 'en')

    const t = (key) => {
      // Try bookingMessages first, then messages
      return (
        bookingMessages[language.value]?.[key] ||
        messages[language.value]?.[key] ||
        key
      )
    }

    const handleLangChange = () => {
      language.value = window.currentLang
    }

    const equipmentName = computed(() => equipment.value ? equipment.value.name : '')

    onMounted(() => {
      window.scrollTo({ top: 0, left: 0 })
      loadData()
      window.addEventListener('languagechange', handleLangChange)
    })
    onUnmounted(() => window.removeEventListener('languagechange', handleLangChange))

    return {
      t,
      timeSlots,
      days,
      availability,
      selectedSlot,
      selectSlot,
      isSelected,
      confirmBooking,
      goBack,
      equipmentName
    }
  }
}
