export function getDummyBookings(count = 6) {
  const equipments = ['Treadmill', 'Elliptical', 'Rowing Machine', 'Bench Press', 'Squat Rack', 'Stationary Bike']
  const bookings = []

  for (let i = 0; i < count; i++) {
    const start = new Date()
    start.setDate(start.getDate() + i)
    const end = new Date(start)
    end.setHours(end.getHours() + 1)

    bookings.push({
      id: i + 1,
      equipment: equipments[i % equipments.length],
      date: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: `${start.getHours()}:00 - ${end.getHours()}:00`,
      image: `https://source.unsplash.com/featured/400x300?gym,equipment&sig=${i}`
    })
  }

  return bookings
}

const bookingsData = getDummyBookings(6).map((item, idx) => ({
  ...item,
  tagId: (idx % 7) + 1 // 1-7循环
}))

export default bookingsData
