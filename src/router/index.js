import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home'
import Schedule from '../pages/Schedule'
import Booking from '../pages/Booking'
import Workout from '../pages/Workout'
import Profile from '../pages/Profile'
import EquipmentSchedule from '../pages/EquipmentSchedule'
import AuthPage from '../pages/Auth/index'


import FAQ from '../pages/FAQ'
import Upgrade from '../pages/Upgrade'

// 简易登录态检查，可根据项目需要替换为真正的验证逻辑
function isLoggedIn() {
  // 这里暂时返回true
  return true;
}

// 需要登录才能访问的路由集合，后续可在此处增删
const protectedPaths = ['/workout', '/schedule', '/booking', '/profile']

const routes = [
  { path: '/', redirect: '/home' },  // 🔁 默认重定向到 /home
  { path: '/home', component: Home },
  { path: '/schedule', component: Schedule },
  { path: '/booking', component: Booking },
  { path: '/workout', component: Workout },
  { path: '/profile', component: Profile },
  { path: '/faq', component: FAQ },
  { path: '/upgrade', component: Upgrade },

  { path: '/equipment/:id/schedule', component: EquipmentSchedule },
  // 登录页占位，后续实现真正的登录页面
  { path: '/Auth', component: AuthPage },
  { path: '/video-player', component: () => import('../pages/Videos/VideoPlayer.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫：若目标路由需要登录且当前未登录，则跳转至 /login
router.beforeEach((to, _from, next) => {
  if (protectedPaths.includes(to.path) && !isLoggedIn()) {
    next('/login')
  } else {
    next()
  }
})

export default router
