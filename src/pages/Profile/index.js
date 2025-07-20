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

export default {
  name: 'ProfilePage',
  components: { NavBar, Footer },
  template,
  setup() {
    const currentTab = ref('profile')
    const router = useRouter()
    const firebaseService = FirebaseService.getInstance()
    const auth = getAuth()
    const userName = ref('用户名')
    const userAvatar = ref('/src/assets/images/default-avatar.png')
    const handlePasswordChange = async () => {
      const oldPass = document.getElementById('oldPassword').value.trim()
      const newPass = document.getElementById('newPassword').value.trim()
      const confirmPass = document.getElementById('confirmPassword').value.trim()
      const messageEl = document.getElementById('passwordMessage')
    
      messageEl.classList.remove('text-green-600')
      messageEl.classList.add('text-red-500')
    
      if (!oldPass || !newPass || !confirmPass) {
        messageEl.innerText = '请填写所有密码字段'
        return
      }
    
      if (newPass !== confirmPass) {
        messageEl.innerText = '两次新密码不一致'
        return
      }
    
      const user = auth.currentUser
      if (!user) {
        messageEl.innerText = '用户未登录'
        return
      }
    
      // ⚠️ 关键步骤：重新认证（reauthenticate）
      try {
        const credential = EmailAuthProvider.credential(user.email, oldPass)
        await reauthenticateWithCredential(user, credential)
    
        // 验证成功，修改密码
        await updatePassword(user, newPass)
    
        messageEl.innerText = '✅ 密码修改成功'
        messageEl.classList.remove('text-red-500')
        messageEl.classList.add('text-green-600')
      } catch (err) {
        console.error('修改密码失败：', err)
        if (err.code === 'auth/wrong-password') {
          messageEl.innerText = '当前密码错误'
        } else {
          messageEl.innerText = '修改失败: ' + err.message
        }
      }
    }

    // 缓存 uid，避免多次读 localStorage
    const uid = localStorage.getItem('userId')

    const switchTab = (tab) => {
      currentTab.value = tab
      // 如果你使用 v-if 而不是 v-show，可在这里触发重新加载用户数据（见下方可选函数）
      // if (tab === 'profile') { loadUserProfile() }
    }

    const logout = () => {
      localStorage.removeItem('userId')
      localStorage.removeItem('isAdmin')
      router.push('/home')
    }

    // ========== 电话验证：MY + CN ==========
    function isValidPhoneNumber(phone) {
      phone = phone.replace(/[\s\-]/g, '') // 去掉空格和短横线
      const myRegex = /^01\d{7,8}$/       // 马来西亚：01开头 + 7~8位数字（按你原要求）
      const cnRegex = /^1\d{10}$/         // 中国大陆：1开头 + 共11位
      return myRegex.test(phone) || cnRegex.test(phone)
    }

    // ========== 头像上传 ==========
    const handleAvatarUpload = async (e) => {
      const file = e.target.files[0]
      if (!file || !uid) return
    
      const storage = getStorage()
      const avatarRef = storageRef(storage, `avatars/${uid}`)
    
      try {
        await uploadBytes(avatarRef, file)
        const downloadURL = await getDownloadURL(avatarRef)
    
        userAvatar.value = downloadURL
    
        // ✅ 上传成功后再更新 preview
        const preview = document.getElementById('avatarPreview')
        if (preview) preview.src = downloadURL
    
        // 保存到数据库
        const userDoc = doc(firebaseService.db, 'users', uid)
        await updateDoc(userDoc, { avatar: downloadURL })
    
        window.dispatchEvent(new CustomEvent('user-avatar-updated'))
        console.log('头像上传成功:', downloadURL)
      } catch (err) {
        console.error('头像上传失败：', err)
      }
    }
    

    // ========== 加载用户资料（封装成函数，必要时可重复调用） ==========
    const loadUserProfile = async () => {
      if (!uid) return
      const docRef = doc(firebaseService.db, 'users', uid)

      try {
        const snap = await getDoc(docRef)
        if (!snap.exists()) return
        const user = snap.data()
        userName.value = user.name || '用户名'
        userAvatar.value = user.avatar || '/src/assets/images/default-avatar.png'

        // 填充表单
        const $ = (id) => document.getElementById(id)
        $('profileName').value = user.name || ''
        $('profileAge').value = user.age || ''
        $('profileGender').value = user.gender || 'other'
        $('profileIdentity').value = user.identity || 'student'
        $('profileAddress').value = user.address || 'Xiamen University Malaysia'
        $('phoneInput').value = user.phone || ''

        // 显示头像
        const preview = $('avatarPreview')
        if (preview) {
          preview.src = user.avatar || '/src/assets/images/default-avatar.png'
        }
      } catch (err) {
        console.error('加载用户信息失败：', err)
      }
    }

    // ========== 提交表单 ==========
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

        if (!name || isNaN(age)) {
          messageEl.innerText = '请填写完整信息'
          messageEl.classList.remove('text-green-600')
          messageEl.classList.add('text-red-500')
          return
        }

        if (!isValidPhoneNumber(phone)) {
          messageEl.innerText = '请输入有效的 MY 或 CN 电话号码'
          messageEl.classList.remove('text-green-600')
          messageEl.classList.add('text-red-500')
          return
        }

        try {
          await updateDoc(docRef, { name, age, gender, identity, address, phone })
          messageEl.innerText = '✅ 修改成功'
          messageEl.classList.remove('text-red-500')
          messageEl.classList.add('text-green-600')
        } catch (err) {
          messageEl.innerText = '保存失败: ' + err.message
          messageEl.classList.remove('text-green-600')
          messageEl.classList.add('text-red-500')
        }
      })
    }

    // ========== 生命周期：挂载后执行 ==========
    onMounted(async () => {
      await loadUserProfile()
      attachSubmitHandler()
    })

    // 暴露给模板
    return {
      currentTab,
      switchTab,
      logout,
      handleAvatarUpload,
      userName,
      userAvatar,
      handlePasswordChange
    }
    
  }
}
