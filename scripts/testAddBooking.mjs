/* eslint-env node */
import FirebaseService from '../src/services/firebaseService.js'
import { Booking } from '../src/models/index.js'
import firebaseConfig from '../src/firebaseConfig.local.js'

// Initialise FirebaseService with local config
FirebaseService.init(firebaseConfig)

// 测试用户ID - 请替换为实际的用户ID
const testUserId = 'test-user-123'

// 创建测试booking数据
const createTestBookings = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dayAfterTomorrow = new Date(now)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

  return [
    new Booking({
      userId: testUserId,
      equipmentId: 'test-equipment-1',
      startTime: new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000), // 9:00 AM tomorrow
      endTime: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000),  // 10:00 AM tomorrow
      status: 'active'
    }),
    new Booking({
      userId: testUserId,
      equipmentId: 'test-equipment-2',
      startTime: new Date(dayAfterTomorrow.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM day after tomorrow
      endTime: new Date(dayAfterTomorrow.getTime() + 15 * 60 * 60 * 1000),   // 3:00 PM day after tomorrow
      status: 'active'
    }),
    new Booking({
      userId: testUserId,
      equipmentId: 'test-equipment-3',
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),   // 3 hours from now
      status: 'cancelled'
    })
  ]
}

async function addTestBookings() {
  try {
    const fs = FirebaseService.getInstance()
    const bookings = createTestBookings()

    console.log('Adding test bookings...')

    for (const booking of bookings) {
      const id = await fs.addBooking(booking, { autoId: true })
      console.log('✅ Added booking with id:', id)
      console.log('  - Equipment:', booking.equipmentId)
      console.log('  - Start:', booking.startTime)
      console.log('  - End:', booking.endTime)
      console.log('  - Status:', booking.status)
    }

    console.log('✅ All test bookings added successfully!')
  } catch (err) {
    console.error('❌ Failed to add bookings:', err)
  }
}

// 运行测试
addTestBookings()
