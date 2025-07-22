import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home'
import Schedule from '../pages/Schedule'
import Booking from '../pages/Booking'
import Workout from '../pages/Workout'
import Profile from '../pages/Profile'
import Map from '../pages/Map'
import EquipmentSchedule from '../pages/EquipmentSchedule'
import AuthPage from '../pages/Auth/index'
import Description from '../pages/Description'


import FAQ from '../pages/FAQ'
import Upgrade from '../pages/Upgrade'

// 简易登录态检查，可根据项目需要替换为真正的验证逻辑
function isLoggedIn() {
  // 简易检查：localStorage 中存在 userId 即视为已登录
  return Boolean(localStorage.getItem('userId'))
}

// 需要登录才能访问的路由集合，后续可在此处增删
const protectedPaths = ['/workout', '/schedule', '/profile']

const routes = [
  { path: '/', redirect: '/home' },  // 🔁 默认重定向到 /home
  { path: '/home', component: Home },
  { path: '/map', component: Map },
  { path: '/schedule', component: Schedule },
  { path: '/booking', component: Booking },
  { path: '/workout', component: Workout },
  { path: '/profile', component: Profile },
  { path: '/faq', component: FAQ },
  { path: '/upgrade', component: Upgrade },

  { path: '/equipment/:id/schedule', component: EquipmentSchedule },
  { path: '/equipment/:id/description', component: Description },
  // 登录 / 注册页面
  { path: '/login', component: AuthPage },
  // 兼容旧路径 /Auth
  { path: '/Auth', redirect: '/login' },
  { path: '/video-player', component: () => import('../pages/Videos/VideoPlayerComponent.js') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Ensure each route navigation scrolls to top
  scrollBehavior() {
    return { left: 0, top: 0 }
  }
})

// 全局前置守卫：若目标路由需要登录且当前未登录，则跳转至 /login
router.beforeEach((to, _from, next) => {
  // 检查精确路径匹配
  if (protectedPaths.includes(to.path) && !isLoggedIn()) {
    next('/login')
    return
  }

  // 检查动态路由 /equipment/:id/schedule
  if (to.path.match(/^\/equipment\/.*\/schedule$/) && !isLoggedIn()) {
    next('/login')
    return
  }

  next()
})

export default router
