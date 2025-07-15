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

      // 显示或隐藏注册字段
      document.getElementById('confirmGroup').classList.toggle('hidden', isLogin)
      document.getElementById('ageGroup').classList.toggle('hidden', isLogin)
      document.getElementById('genderGroup').classList.toggle('hidden', isLogin)

      // 更新提示文字
      document.getElementById('toggleText').innerHTML = isLogin
        ? `Don't have an account? <span id="toggleAuth" class="auth-toggle-link">Sign Up</span>`
        : `Already have an account? <span id="toggleAuth" class="auth-toggle-link">Login</span>`

      // 重新绑定 toggleAuth
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

          localStorage.setItem('userId', uid)
          localStorage.setItem('isAdmin', newUser.role === 'admin' ? 'true' : 'false')

          location.href = '/home'
        } catch (err) {
          showError(err.message)
        }
      } else {
        // login
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

    onMounted(() => {
      document.getElementById('authForm')?.addEventListener('submit', handleSubmit)
      document.getElementById('toggleAuth')?.addEventListener('click', toggleMode)

      // 初始渲染 UI
      updateModeUI()
    })

    return {}
  }
}
