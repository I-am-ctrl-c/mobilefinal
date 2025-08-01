// src/pages/Auth/index.js
import { ref, onMounted } from 'vue'
import template from './auth.html?raw'
import './auth.css'

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import FirebaseService from '../../services/firebaseService'
import User from '../../models/User.js'

export default {
  name: 'AuthPage',
  template,
  setup() {
    const mode = ref('login')
    const auth = getAuth()
    const firebaseService = FirebaseService.getInstance()
    const db = firebaseService.db

    const updateModeUI = () => {
      const isLogin = mode.value === 'login'
      document.getElementById('authButton').innerText = isLogin ? 'Login' : 'Register'
      document.getElementById('confirmGroup').classList.toggle('hidden', isLogin)
      document.getElementById('ageGroup').classList.toggle('hidden', isLogin)
      document.getElementById('genderGroup').classList.toggle('hidden', isLogin)
      document.getElementById('toggleText').innerHTML = isLogin
        ? `Don't have an account? <span id="toggleAuth" class="auth-toggle-link">Sign Up</span>`
        : `Already have an account? <span id="toggleAuth" class="auth-toggle-link">Login</span>`
      document.getElementById('toggleAuth').addEventListener('click', toggleMode)
    }

    const toggleMode = () => {
      mode.value = mode.value === 'login' ? 'register' : 'login'
      updateModeUI()
    }

    const showError = (message) => {
      document.getElementById('formMessage').innerText = message
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      const nameEl = document.getElementById('name')
      const email = document.getElementById('email')?.value.trim()
      const password = document.getElementById('password')?.value.trim()

      if (!email || !password || !nameEl) {
        showError('Please fill all fields')
        return
      }

      const name = nameEl.value.trim()

      if (mode.value === 'register') {
        const confirm = document.getElementById('confirm')?.value.trim()
        const age = parseInt(document.getElementById('age')?.value.trim())
        const gender = document.getElementById('gender')?.value

        if (password !== confirm) {
          showError('Passwords do not match')
          return
        }

        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password)
          const uid = cred.user.uid

          const newUser = new User({
            id: uid,
            name,
            email,
            gender,
            age,
            role: email === 'admin@xmu.edu.my' ? 'admin' : 'user'
          })

          await firebaseService.addUser(newUser)

          // 存储信息供登录页自动填充
          sessionStorage.setItem('prefillName', name)
          sessionStorage.setItem('prefillEmail', email)

          location.reload() // 注册成功后自动跳转到登录页
        } catch (err) {
          showError(err.message)
        }
      } else {
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password)
          const uid = cred.user.uid
          const userDoc = await getDoc(doc(db, 'users', uid))
          if (!userDoc.exists()) {
            await signOut(auth)
            showError('User not found in Firestore')
            return
          }

          const data = userDoc.data()
          if (data.name !== name) {
            await signOut(auth)
            showError('Name does not match records')
            return
          }

          const isAdmin = data.role === 'admin'
          localStorage.setItem('userId', uid)
          localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false')

          location.href = '/home'
        } catch (err) {
          showError(err.message)
        }
      }
    }

    const bindPasswordToggles = () => {
      const toggles = document.querySelectorAll('.toggle-password')
      toggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
          const targetId = toggle.getAttribute('data-target')
          const input = document.getElementById(targetId)
          if (input.type === 'password') {
            input.type = 'text'
            toggle.classList.add('visible')
          } else {
            input.type = 'password'
            toggle.classList.remove('visible')
          }
        })
      })
    }

    // 新增：激励文字轮播
    const startMotivationalText = () => {
      const slides = document.querySelectorAll('.text-slide')
      let currentSlide = 0

      const showSlide = (index) => {
        slides.forEach((slide, i) => {
          if (i === index) {
            slide.classList.add('active')
          } else {
            slide.classList.remove('active')
          }
        })
      }

      const nextSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length
        showSlide(currentSlide)
      }

      // 每5秒切换一次，给用户更多时间阅读
      setInterval(nextSlide, 5000)
    }

    // 新增：浮动图标交互
    const initFloatingIcons = () => {
      const icons = document.querySelectorAll('.floating-icon')

      icons.forEach(icon => {
        // 添加点击效果
        icon.addEventListener('click', () => {
          icon.style.animation = 'none'
          setTimeout(() => {
            icon.style.animation = ''
          }, 100)
        })
      })
    }

    onMounted(() => {
      document.getElementById('authForm')?.addEventListener('submit', handleSubmit)
      document.getElementById('toggleAuth')?.addEventListener('click', toggleMode)
      bindPasswordToggles()
      updateModeUI()

      // 自动填充注册信息
      const prefillName = sessionStorage.getItem('prefillName')
      const prefillEmail = sessionStorage.getItem('prefillEmail')
      if (prefillName && prefillEmail) {
        document.getElementById('name').value = prefillName
        document.getElementById('email').value = prefillEmail
        sessionStorage.removeItem('prefillName')
        sessionStorage.removeItem('prefillEmail')
      }

      // 启动交互效果
      startMotivationalText()
      initFloatingIcons()
    })

    return {}
  }
}
