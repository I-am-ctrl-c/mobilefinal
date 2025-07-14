import bookingTemplate from './booking.html?raw'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'
import messages from '../../i18n/bookingMessages.js'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { fetchEquipments } from '../../utils/equipmentData.js'

export default {
  name: 'BookingPage',
  components: { NavBar, Footer },
  template: bookingTemplate,
  setup() {
    const language = ref(window.currentLang || 'en')

    const t = (key) => {
      return messages[language.value]?.[key] || key
    }

    const handleLangChange = () => {
      language.value = window.currentLang
    }

    // Category tags – can be dynamically adjusted later
    const categories = [
      'All Equipments',
      'Upper Body',
      'Lower Body',
      'Core',
      'Cardio',
      'Glutes',
      'Leg'
    ]

    const tags = ref(categories.map((name) => ({ name })))
    const selectedCategory = ref('All Equipments')
    const searchQuery = ref('')

    const equipments = ref([])

    function toggleTag(tagName) {
      if (selectedCategory.value === tagName) {
        // clicking again to deselect (shows All)
        selectedCategory.value = 'All Equipments'
      } else {
        selectedCategory.value = tagName
      }
    }

    async function updateList() {
      const cats = selectedCategory.value && selectedCategory.value !== 'All Equipments'
        ? [selectedCategory.value]
        : []
      equipments.value = await fetchEquipments({ searchText: searchQuery.value, categories: cats })
    }

    watch([searchQuery, selectedCategory], updateList)

    onMounted(() => {
      updateList()
      window.addEventListener('languagechange', handleLangChange)
    })
    onUnmounted(() => window.removeEventListener('languagechange', handleLangChange))

    return { t, equipments, tags, selectedCategory, searchQuery, toggleTag }
  }
}
