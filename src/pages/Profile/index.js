import template from './profile.html?raw'
import './profile.css'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, onMounted } from 'vue'
import FirebaseService from '../../services/firebaseService.js'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import profileMessages from '../../i18n/profile.js'

export default {
  name: 'ProfilePage',
  components: { NavBar, Footer },
  template,
  setup() {
    const currentTab = ref('profile')
    const isEditing = ref(false)
    const userName = ref('')
    const userAvatar = ref('/src/assets/images/default-avatar.jpg')
    const lang = ref('en')

    const router = useRouter()
    const firebaseService = FirebaseService.getInstance()
    const auth = getAuth()
    const uid = localStorage.getItem('userId')

    // 翻译函数
    const t = (key) => profileMessages[lang.value]?.[key] || key

    const switchTab = (tab) => {
      currentTab.value = tab
    }

    const logout = () => {
      const confirmed = window.confirm(lang.value === 'en' ? 'Are you sure you want to logout?' : '确定要退出登录吗？')
      if (!confirmed) return
    
      localStorage.removeItem('userId')
      localStorage.removeItem('isAdmin')
      router.push('/home')
    }

    // 电话验证（MY / CN）
    function isValidPhoneNumber(phone) {
      phone = phone.replace(/[\s\-]/g, '')
      const myRegex = /^(?:\+60)?1\d{7,8}$/
      const cnRegex = /^(?:\+86)?1\d{10}$/
      return myRegex.test(phone) || cnRegex.test(phone)
    }

    // 加载用户资料
    const loadUserProfile = async () => {
      if (!uid) return
      const docRef = doc(firebaseService.db, 'users', uid)

      try {
        const snap = await getDoc(docRef)
        if (!snap.exists()) return
        const user = snap.data()
        userName.value = user.name || t('nickname')
        userAvatar.value = user.avatar || '/src/assets/images/default-avatar.jpg'

        const $ = (id) => document.getElementById(id)
        $('profileName').value = user.name || ''
        $('profileAge').value = user.age || ''
        $('profileGender').value = user.gender || 'other'
        $('profileIdentity').value = user.identity || 'student'
        $('profileAddress').value = user.address || ''
        $('phoneInput').value = user.phone || ''

        const preview = $('avatarPreview')
        if (preview) {
          preview.src = user.avatar || '/src/assets/images/default-avatar.jpg'
        }
      } catch (err) {
        console.error(t('loadFailed'), err)
      }
    }

    // 表单提交
    const attachSubmitHandler = () => {
      const formEl = document.getElementById('profileForm')
      if (!formEl) return

      const messageEl = document.getElementById('profileMessage')
      const docRef = doc(firebaseService.db, 'users', uid)

      formEl.addEventListener('submit', async (e) => {
        e.preventDefault()

        const name = document.getElementById('profileName').value.trim()
        const age = parseInt(document.getElementById('profileAge').value.trim())
        const gender = document.getElementById('profileGender').value
        const identity = document.getElementById('profileIdentity').value
        const address = document.getElementById('profileAddress').value.trim()
        const phone = document.getElementById('phoneInput').value.trim()

        messageEl.classList.remove('text-green-600', 'text-red-500')

        if (!name || isNaN(age)) {
          messageEl.innerText = t('fillAllFields')
          messageEl.classList.add('text-red-500')
          return
        }

        if (!isValidPhoneNumber(phone)) {
          messageEl.innerText = t('invalidPhone')
          messageEl.classList.add('text-red-500')
          return
        }

        try {
          await updateDoc(docRef, { name, age, gender, identity, address, phone })
          messageEl.innerText = t('updateSuccess')
          messageEl.classList.add('text-green-600')
          isEditing.value = false
        } catch (err) {
          messageEl.innerText = t('saveFailed') + err.message
          messageEl.classList.add('text-red-500')
        }
      })
    }

    // 头像上传
    const handleAvatarUpload = async (e) => {
      const file = e.target.files[0]
      if (!file || !uid) return

      const storage = getStorage()
      const avatarRef = storageRef(storage, `avatars/${uid}`)

      try {
        await uploadBytes(avatarRef, file)
        const downloadURL = await getDownloadURL(avatarRef)
        const newAvatarUrl = downloadURL + '?t=' + Date.now()

        userAvatar.value = newAvatarUrl
        const preview = document.getElementById('avatarPreview')
        if (preview) preview.src = newAvatarUrl

        const userDoc = doc(firebaseService.db, 'users', uid)
        await updateDoc(userDoc, { avatar: newAvatarUrl })

        window.dispatchEvent(new CustomEvent('user-avatar-updated', {
          detail: { avatar: newAvatarUrl }
        }))
      } catch (err) {
        console.error(t('uploadFailed'), err)
      }
    }

    // 密码修改
    const handlePasswordChange = async () => {
      const oldPass = document.getElementById('oldPassword').value.trim()
      const newPass = document.getElementById('newPassword').value.trim()
      const confirmPass = document.getElementById('confirmPassword').value.trim()
      const messageEl = document.getElementById('passwordMessage')

      messageEl.classList.remove('text-green-600')
      messageEl.classList.add('text-red-500')

      if (!oldPass || !newPass || !confirmPass) {
        messageEl.innerText = t('fillAllFields')
        return
      }

      if (newPass !== confirmPass) {
        messageEl.innerText = t('passwordsNotMatch')
        return
      }

      const user = auth.currentUser
      if (!user) {
        messageEl.innerText = t('notLoggedIn')
        return
      }

      try {
        const credential = EmailAuthProvider.credential(user.email, oldPass)
        await reauthenticateWithCredential(user, credential)
        await updatePassword(user, newPass)

        messageEl.innerText = t('passwordUpdateSuccess')
        messageEl.classList.remove('text-red-500')
        messageEl.classList.add('text-green-600')
      } catch (err) {
        console.error(t('passwordChangeFailed'), err)
        if (err.code === 'auth/wrong-password') {
          messageEl.innerText = t('wrongPassword')
        } else {
          messageEl.innerText = t('changeFailed') + err.message
        }
      }
    }

    // 切换编辑模式
    const toggleEdit = () => {
      if (isEditing.value) {
        loadUserProfile()
        isEditing.value = false
      } else {
        isEditing.value = true
      }
    }

    // 生命周期挂载
    onMounted(async () => {
      lang.value = window.currentLang || 'en'
      await loadUserProfile()
      attachSubmitHandler()

      // 监听语言变化
      window.addEventListener('languagechange', () => {
        lang.value = window.currentLang || 'en'
      })
    })

    return {
      currentTab,
      switchTab,
      logout,
      handleAvatarUpload,
      userName,
      userAvatar,
      handlePasswordChange,
      isEditing,
      toggleEdit,
      t
    }
  }
}