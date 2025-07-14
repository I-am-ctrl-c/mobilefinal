import FirebaseService from '../services/firebaseService.js'

/**
 * Fetch equipments from Firebase Firestore and perform optional filtering.
 *
 * @param {Object} opts
 * @param {string} [opts.searchText] – text to search in name / description (case-insensitive)
 * @param {string[]} [opts.categories] – list of category names (tags). If includes 'All Equipments' or empty → no category filter.
 * @returns {Promise<import('../models/Equipment.js').default[]>}
 */
export async function fetchEquipments({ searchText = '', categories = [] } = {}) {
  const service = FirebaseService.getInstance()
  let list = await service.loadAllEquipment()

  // Category filter (tags stored per equipment)
  const hasCategoryFilter = Array.isArray(categories) && categories.length > 0 && !categories.includes('All Equipments')
  if (hasCategoryFilter) {
    list = list.filter(eq => {
      const tags = (eq.tags || []).map(t => t.toLowerCase())
      return categories.some(c => tags.includes(c.toLowerCase()))
    })
  }

  // Search text filter
  if (searchText && searchText.trim()) {
    const q = searchText.trim().toLowerCase()
    list = list.filter(eq => {
      return (
        eq.name.toLowerCase().includes(q) ||
        (eq.description && eq.description.toLowerCase().includes(q))
      )
    })
  }
  return list
}

/**
 * Convenience Composition API helper – returns reactive equipments list and search function.
 *
 * Example usage:
 * const { equipments, loading, search } = useEquipmentSearch()
 * await search('run', ['Cardio'])
 */
import { ref } from 'vue'
export function useEquipmentSearch() {
  const equipments = ref([])
  const loading = ref(false)

  /**
   * Perform search & update reactive equipments list.
   * @param {string} searchText
   * @param {string[]} categories
   */
  async function search(searchText = '', categories = []) {
    loading.value = true
    try {
      equipments.value = await fetchEquipments({ searchText, categories })
    } finally {
      loading.value = false
    }
  }

  return { equipments, loading, search }
}

export const defaultCategories = [
  'All Equipments',
  'Upper Body',
  'Lower Body',
  'Core',
  'Cardio',
  'Glutes',
  'Leg'
]

export default fetchEquipments
