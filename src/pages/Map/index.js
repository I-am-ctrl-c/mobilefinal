import mapTemplate from './map.html?raw'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'
import messages from '../../i18n/mapMessages.js'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'MapPage',
  components: { NavBar, Footer },
  template: mapTemplate,
  setup() {
    const router = useRouter()
    const language = ref(window.currentLang || 'en')
    const selectedGym = ref(null)
    const mapElement = ref(null)
    const markers = ref([])

    const t = (key) => {
      return messages[language.value]?.[key] || key
    }

    const handleLangChange = () => {
      language.value = window.currentLang
    }

    // 健身房位置数据
    const gymLocations = ref([
      {
        id: 1,
        name: 'Xiamen University Malaysia Fitness Center',
        lat: 2.834584231891403,
        lng: 101.70297409767608,
        address: 'Jalan Sunsuria, Bandar Sunsuria, 43900 Sepang, Selangor',
        phone: '+60 3-8705 8605',
        hours: '6:00 AM - 10:00 PM',
        description: 'State-of-the-art fitness facility with modern equipment and professional trainers.',
        image: '/src/assets/images/gym1.jpg'
      },
      {
        id: 2,
        name: 'University of Malaya Sports Complex',
        lat: 3.1213,
        lng: 101.6559,
        address: 'University of Malaya, 50603 Kuala Lumpur',
        phone: '+60 3-7967 3333',
        hours: '6:30 AM - 9:30 PM',
        description: 'Comprehensive sports complex with gymnasium and fitness facilities.',
        image: '/src/assets/images/gym2.jpg'
      },
      {
        id: 3,
        name: 'Universiti Putra Malaysia Fitness Center',
        lat: 2.9747,
        lng: 101.7069,
        address: '43400 UPM Serdang, Selangor',
        phone: '+60 3-9769 1000',
        hours: '6:00 AM - 10:00 PM',
        description: 'Modern fitness center serving UPM students and staff with quality equipment.',
        image: '/src/assets/images/gym3.jpg'
      },
      {
        id: 4,
        name: 'Universiti Kebangsaan Malaysia Sports Center',
        lat: 2.9246,
        lng: 101.7759,
        address: '43600 UKM Bangi, Selangor',
        phone: '+60 3-8921 5555',
        hours: '7:00 AM - 9:00 PM',
        description: 'Full-service sports and fitness facility with Olympic-standard equipment.',
        image: '/src/assets/images/gym4.jpg'
      },
      {
        id: 5,
        name: 'Universiti Teknologi Malaysia Fitness Hub',
        lat: 1.5588,
        lng: 103.6384,
        address: '81310 Skudai, Johor',
        phone: '+60 7-553 3333',
        hours: '6:00 AM - 11:00 PM',
        description: 'Advanced fitness hub with cutting-edge technology and wellness programs.',
        image: '/src/assets/images/gym5.jpg'
      },
      {
        id: 6,
        name: 'Universiti Sains Malaysia Recreation Center',
        lat: 5.3595,
        lng: 100.3022,
        address: '11800 USM, Pulau Pinang',
        phone: '+60 4-653 3888',
        hours: '6:30 AM - 10:30 PM',
        description: 'Complete recreation center with fitness facilities and wellness services.',
        image: '/src/assets/images/gym6.jpg'
      }
    ])

    // 初始化地图
    function initializeMap() {
      const mapContainer = document.getElementById('map')
      if (!mapContainer) {
        console.warn('Map container not found')
        return
      }

      // 清空容器内容
      mapContainer.innerHTML = ''
      
      // 创建地图背景
      mapContainer.style.position = 'relative'
      mapContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      mapContainer.style.overflow = 'hidden'

      // 添加地图标记
      gymLocations.value.forEach(gym => {
        createMapMarker(gym, mapContainer)
      })

      // 默认选中第一个健身房（Xiamen University Malaysia）
      setTimeout(() => {
        selectGym(gymLocations.value[0])
      }, 100)
    }

    // 创建地图标记
    function createMapMarker(gym, container) {
      const marker = document.createElement('div')
      marker.className = 'map-marker'
      marker.setAttribute('data-gym-id', gym.id)
      
      // 计算相对位置（简化的坐标映射）
      const containerRect = container.getBoundingClientRect()
      const x = mapCoordinateX(gym.lng, container.clientWidth)
      const y = mapCoordinateY(gym.lat, container.clientHeight)
      
      marker.style.left = `${x}px`
      marker.style.top = `${y}px`

      // 添加点击事件
      marker.addEventListener('click', () => {
        selectGym(gym)
      })

      // 添加悬停工具提示
      const tooltip = document.createElement('div')
      tooltip.className = 'map-tooltip'
      tooltip.textContent = gym.name
      tooltip.style.display = 'none'
      
      marker.addEventListener('mouseenter', (e) => {
        tooltip.style.display = 'block'
        tooltip.style.left = '50%'
        tooltip.style.transform = 'translateX(-50%) translateY(-100%)'
        marker.appendChild(tooltip)
      })

      marker.addEventListener('mouseleave', () => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip)
        }
      })

      container.appendChild(marker)
    }

    // 简化的坐标映射函数
    function mapCoordinateX(lng, containerWidth) {
      // 马来西亚大致经度范围：100°E - 119°E
      const minLng = 100.0
      const maxLng = 119.0
      const normalizedX = (lng - minLng) / (maxLng - minLng)
      return Math.max(50, Math.min(containerWidth - 50, normalizedX * containerWidth))
    }

    function mapCoordinateY(lat, containerHeight) {
      // 马来西亚大致纬度范围：1°N - 7°N
      const minLat = 1.0
      const maxLat = 7.0
      const normalizedY = 1 - ((lat - minLat) / (maxLat - minLat)) // 翻转Y轴
      return Math.max(50, Math.min(containerHeight - 50, normalizedY * containerHeight))
    }

    // 选择健身房
    function selectGym(gym) {
      selectedGym.value = gym

      // 更新标记样式
      const markers = document.querySelectorAll('.map-marker')
      markers.forEach(marker => {
        marker.classList.remove('active')
        if (parseInt(marker.getAttribute('data-gym-id')) === gym.id) {
          marker.classList.add('active')
        }
      })

      // 模拟地图中心移动到选中的健身房
      animateMapToLocation(gym)
    }

    // 动画移动到位置（视觉效果）
    function animateMapToLocation(gym) {
      const mapContainer = document.getElementById('map')
      if (!mapContainer) return

      mapContainer.style.transform = 'scale(0.95)'
      setTimeout(() => {
        mapContainer.style.transform = 'scale(1)'
      }, 200)
    }

    // 获取路线
    function getDirections() {
      if (!selectedGym.value) return
      
      const { lat, lng } = selectedGym.value
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      window.open(url, '_blank')
    }

    // 跳转到预约页面
    function goToBooking() {
      router.push('/booking')
    }

    onMounted(() => {
      window.addEventListener('languagechange', handleLangChange)
      
      // 等待DOM完全加载后初始化地图
      nextTick(() => {
        setTimeout(() => {
          initializeMap()
        }, 200)
      })
    })

    onUnmounted(() => {
      window.removeEventListener('languagechange', handleLangChange)
    })

    return {
      t,
      language,
      gymLocations,
      selectedGym,
      selectGym,
      getDirections,
      goToBooking
    }
  }
}