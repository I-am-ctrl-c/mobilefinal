import template from '../Schedule/schedule.html?raw'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FirebaseService from '../../services/firebaseService.js'

export default {
  name: 'EquipmentSchedulePage',
  components: { NavBar, Footer },
  template,
  setup() {
    const route = useRoute()
    const eqId = route.params.id

    const equipment = ref(null)
    const capacity = ref(0)

    const timeSlots = Array.from({ length: 15 }, (_, i) => 8 + i) // 8:00-22:00 inclusive

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i)
      return {
        date,
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
      }
    })

    const bookings = ref([])

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

    onMounted(loadData)

    return { timeSlots, days, availability }
  }
}
