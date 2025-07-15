// index.js

import './schedule.css'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'
import FirebaseService from '../../services/firebaseService'
import scheduleTemplate from './schedule.html?raw'

const userId = 'test-user' // Replace with real user ID in production

export default {
  name: 'SchedulePage',
  components: { NavBar, Footer },
  data() {
    return {
      bookings: [],
      equipmentMap: {},
      currentPage: 1,
      pageSize: 5
    }
  },
  async mounted() {
    await this.loadBookings()
  },
  methods: {
    async loadBookings() {
      const service = FirebaseService.getInstance()
      const allEquipment = await service.loadAllEquipment()
      allEquipment.forEach(eq => {
        this.equipmentMap[eq.id] = eq
      })
      service.streamBookingsByUser(userId, this.handleBookings)
    },

    handleBookings(bookings) {
      this.bookings = bookings.sort((a, b) => a.startTime.toDate() - b.startTime.toDate())
      console.log(this.bookings)
    },

    async toggleBookingStatus(booking) {
      const service = FirebaseService.getInstance()
      booking.status = booking.status === 'cancelled' ? 'active' : 'cancelled'
      await service.updateBooking(booking)
    },

    paginatedBookings() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.bookings.slice(start, start + this.pageSize)
    },

    nextPage() {
      if (this.currentPage * this.pageSize < this.bookings.length) {
        this.currentPage++
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    formatDate(dateObj) {
      return new Date(dateObj.toDate()).toLocaleString()
    }
  },
  template: scheduleTemplate
}
