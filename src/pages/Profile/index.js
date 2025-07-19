// Profile/index.js
import template from './profile.html?raw'
import './profile.css'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ProfilePage',
  components: { NavBar, Footer },
  template,
  setup() {
    const currentTab = ref('profile')
    const router = useRouter()

    const switchTab = (tab) => {
      currentTab.value = tab
    }

    const logout = () => {
      localStorage.removeItem('userId')
      localStorage.removeItem('isAdmin')
      router.push('/home')
    }

    const handleAvatarUpload = (e) => {
      const file = e.target.files[0]
      if (file) {
        const preview = document.getElementById('avatarPreview')
        preview.src = URL.createObjectURL(file)
      }
    }

    return {
      currentTab,
      switchTab,
      logout,
      handleAvatarUpload,
    }
  }
}
