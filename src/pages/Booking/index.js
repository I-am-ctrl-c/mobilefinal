import bookingTemplate from './booking.html?raw'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'
import messages from '../../i18n/bookingMessages.js'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchEquipments } from '../../utils/equipmentData.js'

export default {
  name: 'BookingPage',
  components: { NavBar, Footer },
  template: bookingTemplate,
  setup() {
    const router = useRouter()
    const language = ref(window.currentLang || 'en')

    const t = (key) => {
      return messages[language.value]?.[key] || key
    }

    const handleLangChange = () => {
      language.value = window.currentLang
    }

    // Category tags – identifiers stay English; label shown to user depends on language
    const categories = [
      'All Equipments',
      'Upper Body',
      'Lower Body',
      'Core',
      'Cardio',
      'Glutes',
      'Leg'
    ]

    // Static label mapping (extend as needed)
    const categoryLabels = {
      'All Equipments': { en: 'All Equipments', zh: '全部器材' },
      'Upper Body':    { en: 'Upper Body',    zh: '上肢'   },
      'Lower Body':    { en: 'Lower Body',    zh: '下肢'   },
      'Core':          { en: 'Core',          zh: '核心'     },
      'Cardio':        { en: 'Cardio',        zh: '有氧运动'     },
      'Glutes':        { en: 'Glutes',        zh: '臀部'     },
      'Leg':           { en: 'Leg',           zh: '腿部'     }
    }

    // Reactive tags list with translated label
    const tags = computed(() => categories.map(name => ({
      name,
      label: categoryLabels[name]?.[language.value] || name
    })))

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

    function goToDescription(equipmentId) {
      router.push(`/equipment/${equipmentId}/description`)
    }

    async function updateList() {
      const cats = selectedCategory.value && selectedCategory.value !== 'All Equipments'
        ? [selectedCategory.value]
        : []
      equipments.value = await fetchEquipments({
        searchText: searchQuery.value,
        categories: cats,
        language: language.value
      })
    }

    watch([searchQuery, selectedCategory, language], updateList)

    onMounted(() => {
      updateList()
      window.addEventListener('languagechange', handleLangChange)
    })
    onUnmounted(() => window.removeEventListener('languagechange', handleLangChange))

    return { t, equipments, tags, selectedCategory, searchQuery, toggleTag, goToDescription }
  }
}
