// 1. 首先在你的HTML中添加Leaflet CSS和JS
// <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
// <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

import mapTemplate from './map.html?raw'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'
import messages from '../../i18n/mapMessages.js'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'MapPage',
  components: { NavBar, Footer },
  template: mapTemplate,
  setup() {
    const router = useRouter()
    const language = ref(window.currentLang || 'en')
    const selectedGym = ref(null)
    const mapElement = ref(null)
    const leafletMap = ref(null) // 存储Leaflet地图实例
    const mapMarkers = ref([]) // 存储地图标记

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

    // 初始化Leaflet地图
    function initializeMap() {
      console.log('Initializing Leaflet map...')
      const mapContainer = document.getElementById('map')
      if (!mapContainer) {
        console.error('Map container not found')
        return
      }

      // 检查Leaflet是否已加载
      if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded')
        return
      }

      // 清理现有地图
      if (leafletMap.value) {
        leafletMap.value.remove()
      }

      // 创建地图实例，以马来西亚为中心
      leafletMap.value = L.map('map').setView([3.139, 101.6869], 8)

      // 添加地图图层 (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.value)

      // 创建自定义图标
      const gymIcon = L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
            <path fill="#8B5CF6" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            <circle fill="white" cx="12" cy="9" r="1.5"/>
          </svg>
        `),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      })

      const activeGymIcon = L.icon({
        iconUrl: 'data:image/svg+xml;base64=' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
            <path fill="#F59E0B" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            <circle fill="white" cx="12" cy="9" r="1.5"/>
          </svg>
        `),
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      })

      // 清理现有标记
      mapMarkers.value.forEach(marker => {
        leafletMap.value.removeLayer(marker)
      })
      mapMarkers.value = []

      // 添加健身房标记
      gymLocations.value.forEach(gym => {
        const marker = L.marker([gym.lat, gym.lng], { 
          icon: gymIcon,
          gymId: gym.id 
        }).addTo(leafletMap.value)

        // 添加弹出窗口
        marker.bindPopup(`
          <div class="gym-popup">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${gym.name}</h3>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${gym.description}</p>
            <p style="margin: 0; font-size: 12px; color: #888;">
              <i class="fa-solid fa-clock"></i> ${gym.hours}
            </p>
          </div>
        `)

        // 点击标记时选中健身房
        marker.on('click', () => {
          selectGym(gym)
        })

        mapMarkers.value.push(marker)
      })

      // 默认选中第一个健身房
      setTimeout(() => {
        selectGym(gymLocations.value[0])
      }, 100)

      console.log('Leaflet map initialized successfully')
    }

    // 选择健身房
    function selectGym(gym) {
      selectedGym.value = gym

      if (!leafletMap.value) return

      // 更新标记样式
      mapMarkers.value.forEach(marker => {
        const isActive = marker.options.gymId === gym.id
        const icon = isActive ? 
          L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
                <path fill="#F59E0B" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                <circle fill="white" cx="12" cy="9" r="1.5"/>
              </svg>
            `),
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
          }) :
          L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                <path fill="#8B5CF6" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                <circle fill="white" cx="12" cy="9" r="1.5"/>
              </svg>
            `),
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
          })
        
        marker.setIcon(icon)
      })

      // 移动地图视图到选中的健身房
      leafletMap.value.setView([gym.lat, gym.lng], 12, {
        animate: true,
        duration: 0.5
      })

      // 更新按钮样式
      updateGymButtonStyles(gym.id)
    }

    // 更新健身房按钮样式
    function updateGymButtonStyles(selectedId) {
      const buttons = document.querySelectorAll('.gym-button')
      buttons.forEach(button => {
        const gymId = parseInt(button.getAttribute('data-gym-id'))
        if (gymId === selectedId) {
          button.classList.add('active')
        } else {
          button.classList.remove('active')
        }
      })
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
      
      // 清理地图实例
      if (leafletMap.value) {
        leafletMap.value.remove()
      }
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