import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home'
import Schedule from '../pages/Schedule'
import Booking from '../pages/Booking'
import Workout from '../pages/Workout'
import Profile from '../pages/Profile'


const routes = [
  { path: '/', redirect: '/home' },  // 🔁 默认重定向到 /home
  { path: '/home', component: Home },
  { path: '/schedule', component: Schedule },
  { path: '/booking', component: Booking },
  { path: '/workout', component: Workout },
  { path: '/profile', component: Profile },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router