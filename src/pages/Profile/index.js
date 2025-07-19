// Profile/index.js
import './profile.css'
import '../../assets/main.css'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'
import { ref, onMounted } from 'vue'

export default {
  name: 'ProfilePage',
  components: { NavBar, Footer },
  template: `
    <div>
      <NavBar />

      <main class="pt-16">
        <div class="max-w-6xl mx-auto flex background-color-1 rounded-lg shadow-md border border-[var(--bg-4)] overflow-hidden">

          <!-- Sidebar -->
          <aside class="w-64 background-color-3 flex flex-col">
            <div class="flex items-center gap-4 p-6 border-b border-[var(--bg-4)]">
              <div class="w-16 h-16 bg-[var(--bg-4)] rounded-full"></div>
              <div class="text-lg font-semibold font-color-9">名字</div>
            </div>

            <nav class="flex flex-col text-sm font-medium">
              <button class="menu-btn px-6 py-3 text-left" data-tab="profile">个人资料</button>
              <button class="menu-btn px-6 py-3 text-left" data-tab="avatar">修改头像</button>
              <button class="menu-btn px-6 py-3 text-left" data-tab="password">密码安全</button>
              <button class="text-left px-6 py-3 text-red-500">退出登录</button>
            </nav>
          </aside>

          <!-- Main content -->
          <div id="content-container" class="flex-1 p-8 overflow-auto">
            <!-- Content loaded dynamically -->
          </div>
        </div>
      </main>

      <div class="pt-24">
        <Footer />
      </div>
    </div>
  `,
  setup() {
    const currentTab = ref('profile')

    async function loadContent(tab) {
      const container = document.getElementById('content-container')
      if (!container) {
        console.error('找不到内容容器')
        return
      }

      try {
        container.innerHTML = '<div class="p-4 text-center">加载中...</div>'
        const response = await fetch(`./components/${tab}-content.html`)
        if (!response.ok) throw new Error(`HTTP错误: ${response.status}`)
        const html = await response.text()
        container.innerHTML = html

        // 针对 avatar tab 做初始化
        if (tab === 'avatar') {
          initAvatarUploader()
        }
      } catch (error) {
        console.error('加载内容失败:', error)
        container.innerHTML = `
          <div class="p-4 text-red-500 bg-red-50 rounded">
            加载失败: ${error.message}
          </div>
        `
      }
    }

    function changeTab(tab) {
      currentTab.value = tab
      loadContent(tab)
      history.pushState(null, '', `?tab=${tab}`)
    }

    onMounted(() => {
      setTimeout(() => {
        const container = document.getElementById('content-container')
        if (!container) {
          console.error('致命错误：内容容器不存在')
          return
        }

        loadContent(currentTab.value)

        // 事件委托绑定按钮点击
        document.addEventListener('click', (e) => {
          if (e.target.classList.contains('menu-btn')) {
            e.preventDefault()
            const tab = e.target.dataset.tab
            changeTab(tab)
          }
        })
      }, 100)
    })

    // 前进后退处理
    window.addEventListener('popstate', () => {
      const urlParams = new URLSearchParams(window.location.search)
      const tab = urlParams.get('tab') || 'profile'
      changeTab(tab)
    })

    return { currentTab }
  }
}

// 头像上传初始化函数
function initAvatarUploader() {
  console.log('初始化头像上传功能')
  const upload = document.getElementById('avatar-upload')
  if (upload) {
    upload.addEventListener('change', () => {
      const file = upload.files[0]
      if (file) {
        const preview = document.getElementById('avatar-preview')
        preview.src = URL.createObjectURL(file)
      }
    })
  }
}
