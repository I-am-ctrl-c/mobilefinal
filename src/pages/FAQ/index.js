import template from './faq.html?raw'
import faqMessages from '../../i18n/faq.js'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import { ref, onMounted } from 'vue'

export default {
  name: 'FAQ',
  components: { NavBar, Footer },
  template,
  setup() {
    const lang = ref('en')
  
    const t = (key) => faqMessages[lang.value]?.[key] || key
  
    onMounted(() => {
      lang.value = window.currentLang || 'en'
  
      // FAQ 折叠交互（改进版）
      const faqItems = document.querySelectorAll('.faq-toggle')
      faqItems.forEach((item) => {
        item.addEventListener('click', () => {
          const answer = item.nextElementSibling
          const isHidden = answer.classList.contains('hidden')
  
          // 显示/隐藏答案
          answer.classList.toggle('hidden', !isHidden)
  
          // 背景与字体颜色切换
          item.classList.toggle('bg-white', !isHidden)
          item.classList.toggle('text-black', !isHidden)
          item.classList.toggle('bg-purple-600', isHidden)
          item.classList.toggle('text-white', isHidden)
  
          // 切换按钮内容（+ / −）
          const btn = item.querySelector('.faq-btn')
          if (btn) {
            btn.textContent = isHidden ? '−' : '+'
          }
        })
      })
  
      // 语言切换
      window.addEventListener('languagechange', () => {
        lang.value = window.currentLang || 'en'
      })
    })
  
    return { t }
  }
  
}
