import workoutTemplate from './workout.html?raw'
import Footer from '../../components/Footer'
import workoutImg from '../../assets/images/Workout.jpg'

export default {
  name: 'WorkoutPage',
  components: { Footer },
  template: workoutTemplate,
  setup() {
    return { workoutImg }
  }
} 