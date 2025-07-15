import FirebaseService from '../services/firebaseService.js'

/**
 * Fetch equipments from Firebase Firestore and perform optional filtering.
 *
 * @param {Object} opts
 * @param {string} [opts.searchText] – text to search in name / description (case-insensitive)
 * @param {string[]} [opts.categories] – list of category names (tags). If includes 'All Equipments' or empty → no category filter.
 * @param {string} [opts.language] – language code ('en' or 'zh') to determine which fields to display
 * @returns {Promise<import('../models/Equipment.js').default[]>}
 */
export async function fetchEquipments({ searchText = '', categories = [], language = 'en' } = {}) {
  // Use cached list to avoid unnecessary network requests
  let list = await _getAllEquipmentCached()

  // Create localized version of equipment list
  const localizedList = list.map(eq => {
    if (language === 'zh') {
      return {
        ...eq,
        name: eq.name_cn || eq.name,
        description: eq.description_cn || eq.description,
        tags: eq.tags_cn && eq.tags_cn.length > 0 ? eq.tags_cn : eq.tags
      }
    }
    return eq
  })

  // Category filter (tags stored per equipment)
  const hasCategoryFilter = Array.isArray(categories) && categories.length > 0 && !categories.includes('All Equipments')
  if (hasCategoryFilter) {
    list = localizedList.filter(eq => {
      const tags = (eq.tags || []).map(t => t.toLowerCase())
      // For Chinese language, we need to filter using the localized tags
      if (language === 'zh') {
        // Convert English category names back to Chinese for comparison
        const chineseCategories = categories.map(cat => {
          // This mapping should match the categoryLabels in Booking page
          const categoryMap = {
            'Upper Body': '上肢',
            'Lower Body': '下肢',
            'Core': '核心',
            'Cardio': '有氧运动',
            'Glutes': '臀部',
            'Leg': '腿部'
          }
          return categoryMap[cat] || cat
        }).map(c => c.toLowerCase())
        return chineseCategories.some(c => tags.includes(c))
      } else {
        return categories.some(c => tags.includes(c.toLowerCase()))
      }
    })
  } else {
    list = localizedList
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

// ─────────────────────────── In-memory cache helpers ───────────────────────────

/**
 * Simple in-memory cache for the full equipment list so that we don't
 * query Firestore on every filter/search interaction when staying inside the
 * same browser tab. The cache is kept module-local and therefore survives
 * as long as the page is not reloaded. If you need longer-lived caching
 * (e.g. across reloads) consider persisting to localStorage.
 *
 * NOTE: We purposefully keep the implementation minimal. You can extend this
 * by adding an expiry/TTL or a `forceRefresh` parameter in the future.
 */

/** @type {import('../models/Equipment.js').default[] | null} */
let _equipmentCache = null

/**
 * Fetch all equipment – uses the in-memory cache when available.
 * @returns {Promise<import('../models/Equipment.js').default[]>}
 */
async function _getAllEquipmentCached() {
  if (_equipmentCache) return _equipmentCache
  const service = FirebaseService.getInstance()
  _equipmentCache = await service.loadAllEquipment()
  return _equipmentCache
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
