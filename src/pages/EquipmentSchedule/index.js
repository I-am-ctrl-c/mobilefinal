import template from './equipmentschedule.html?raw'
import './equipmentschedule.css'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
    const eqId = computed(() => route.params.id)

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

    const allEquipments = ref([])

    async function loadData(id) {
      const service = FirebaseService.getInstance()

      // Load current equipment details
      equipment.value = await service.getEquipment(id)
      capacity.value = equipment.value.available || 0

      // Fetch all equipments for selector (cache once)
      if (allEquipments.value.length === 0) {
        allEquipments.value = await service.loadAllEquipment()
      }

      // fetch bookings between now and +7d
      service.streamBookingsByEquipment(id, list => {
        bookings.value = list.filter(b => b.endTime >= new Date())
      })
    }

    const equipmentOptions = computed(() => {
      const lang = language.value
      return allEquipments.value.map(e => ({
        id: e.id,
        label: lang === 'zh' ? (e.name_cn || e.name) : e.name
      }))
    })

    function goToEquipment(id) {
      if (id === eqId.value) return
      router.push(`/equipment/${id}/schedule`)
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

    const equipmentName = computed(() => {
      if (!equipment.value) return ''
      if (language.value === 'zh') return equipment.value.name_cn || equipment.value.name
      return equipment.value.name
    })

    onMounted(() => {
      window.scrollTo({ top: 0, left: 0 })
      loadData(route.params.id)
      window.addEventListener('languagechange', handleLangChange)
    })
    onUnmounted(() => window.removeEventListener('languagechange', handleLangChange))

    // Watch for route id changes
    watch(() => route.params.id, (newId, oldId) => {
      if (newId && newId !== oldId) {
        window.scrollTo({ top: 0, left: 0 })
        loadData(newId)
      }
    })

    const onWheelScroll = (event) => {
      const el = event.currentTarget
      if (el && el.scrollLeft !== undefined) {
        el.scrollLeft += event.deltaY
      }
    }

    const scrollContainer = ref(null)
    function scrollLeft() {
      if (scrollContainer.value) scrollContainer.value.scrollLeft -= 200
    }
    function scrollRight() {
      if (scrollContainer.value) scrollContainer.value.scrollLeft += 200
    }

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
      equipmentName,
      equipmentOptions,
      goToEquipment,
      eqId,
      onWheelScroll,
      scrollLeft,
      scrollRight,
      scrollContainer
    }
  }
}
