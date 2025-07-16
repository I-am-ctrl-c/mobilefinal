import { useRouter } from 'vue-router'
import profileTemplate from './profile.html?raw'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'

export default {
  name: 'ProfilePage',
  components: { NavBar, Footer },
  template: profileTemplate,
  setup() {
    const router = useRouter()

    const logout = () => {
      // Clear localStorage
      localStorage.removeItem('userId')
      localStorage.removeItem('isAdmin')

      // Redirect to home page
      router.push('/home')
    }

    return {
      logout
    }
  }
}
