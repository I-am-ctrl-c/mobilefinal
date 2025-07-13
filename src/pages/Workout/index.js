import workoutTemplate from './workout.html?raw'
import Footer from '../../components/Footer'
import workoutImg from '../../assets/images/Workout.jpg'
import { ref, computed } from 'vue'

export default {
  name: 'WorkoutPage',
  components: { Footer },
  template: workoutTemplate,
  setup() {
    const workoutImgRef = ref(workoutImg)

    // 生成从 2020-01-01 到今天的周起始列表（每周日）
    const generateWeekRanges = () => {
      const result = []
      let start = new Date('2020-01-01')
      const today = new Date()

      // 调整到最近的周日
      while (start.getDay() !== 0) {
        start.setDate(start.getDate() - 1)
      }

      while (start <= today) {
        const end = new Date(start)
        end.setDate(end.getDate() + 6)
        result.push({ start: new Date(start), end })
        start.setDate(start.getDate() + 7)
      }

      return result
    }

    const weeks = generateWeekRanges()
    const currentIndex = ref(weeks.length - 1)

    const weekDisplay = computed(() => {
      const range = weeks[currentIndex.value]
      const fmt = (d) =>
        `${d.getMonth() + 1}.${d.getDate()}`
      return `${fmt(range.start)} – ${fmt(range.end)}`
    })

    const prevWeek = () => {
      if (currentIndex.value > 0) currentIndex.value--
    }

    const nextWeek = () => {
      if (currentIndex.value < weeks.length - 1) currentIndex.value++
    }

    return {
      workoutImg: workoutImgRef,
      weekDisplay,
      prevWeek,
      nextWeek
    }
  }
}
