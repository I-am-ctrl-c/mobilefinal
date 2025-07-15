import descriptionTemplate from './description.html?raw'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'
import messages from '../../i18n/descriptionMessages.js'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FirebaseService from '../../services/firebaseService.js'

export default {
  name: 'DescriptionPage',
  components: { NavBar, Footer },
  template: descriptionTemplate,
  setup() {
    const route = useRoute()
    const router = useRouter()
    const language = ref(window.currentLang || 'en')
    const originalEquipment = ref(null)
    const equipment = ref(null)

    function localizeEquipment() {
      if (!originalEquipment.value) {
        equipment.value = null
        return
      }
      const data = originalEquipment.value
      if (language.value === 'zh') {
        equipment.value = {
          ...data,
          name: data.name_cn || data.name,
          description: data.description_cn || data.description,
          tags: data.tags_cn && data.tags_cn.length > 0 ? data.tags_cn : data.tags
        }
      } else {
        equipment.value = { ...data }
      }
    }

    // watch for language or originalEquipment change
    watch([language, originalEquipment], localizeEquipment, { immediate: true })

    // 标签显示（若没有 tags_cn 则按映射翻译）
    const categoryLabelMap = {
      'Upper Body': '上肢',
      'Lower Body': '下肢',
      'Core': '核心',
      'Cardio': '有氧运动',
      'Glutes': '臀部',
      'Leg': '腿部'
    }

    const displayTags = computed(() => {
      if (!equipment.value) return []
      if (language.value === 'zh') {
        return equipment.value.tags.map(t => categoryLabelMap[t] || t)
      }
      return equipment.value.tags
    })
    const loading = ref(true)

    const t = (key) => {
      return messages[language.value]?.[key] || key
    }

    const handleLangChange = () => {
      language.value = window.currentLang
    }

    // 处理描述文本分段
    const descriptionParagraphs = computed(() => {
      if (!equipment.value) return []

      let description = equipment.value.description

      // 如果是中文模式且有中文描述，使用中文描述
      if (language.value === 'zh' && equipment.value.description_cn) {
        description = equipment.value.description_cn
      }

      if (!description) return []

      // 按段落分割描述文本
      // 支持多种分段方式：双换行、句号+换行、感叹号+换行、问号+换行
      const paragraphs = description
        .split(/\n\n|\.\n|!\n|\?\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0)

      // 如果没有明显的分段，尝试按句号分割
      if (paragraphs.length === 1 && description.length > 100) {
        const sentences = description
          .split(/\.|。/)
          .map(s => s.trim())
          .filter(s => s.length > 10)

        // 如果句子很多，每2-3句组成一段
        if (sentences.length > 3) {
          const grouped = []
          for (let i = 0; i < sentences.length; i += 2) {
            const group = sentences.slice(i, i + 2).join(language.value === 'zh' ? '。' : '. ')
            if (group.trim()) {
              grouped.push(group + (language.value === 'zh' ? '。' : '.'))
            }
          }
          return grouped
        }

        return sentences.map(s => s + (language.value === 'zh' ? '。' : '.'))
      }

      return paragraphs
    })

    // 加载器材信息
    async function loadEquipment() {
      const equipmentId = route.params.id
      if (!equipmentId) {
        console.error('No equipment ID provided')
        loading.value = false
        return
      }

      try {
        const service = FirebaseService.getInstance()
        const equipmentData = await service.getEquipment(equipmentId)

        if (equipmentData) {
          originalEquipment.value = equipmentData
        } else {
          console.error('Equipment not found')
        }
      } catch (error) {
        console.error('Error loading equipment:', error)
      } finally {
        loading.value = false
      }
    }

    // 跳转到器材预约页面
    function goToSchedule() {
      if (equipment.value) {
        router.push(`/equipment/${equipment.value.id}/schedule`)
      }
    }

    // watch language to trigger computed invalidation automatically

    onMounted(() => {
      window.scrollTo({ top: 0, left: 0 }) // 确保进入页面时滚动到顶部
      loadEquipment()
      window.addEventListener('languagechange', handleLangChange)
    })

    onUnmounted(() => {
      window.removeEventListener('languagechange', handleLangChange)
    })

    // 返回上一页
    function goBack() {
      router.back()
    }

    return {
      t,
      equipment,
      loading,
      descriptionParagraphs,
      goToSchedule,
      goBack,
      displayTags
    }
  }
}
