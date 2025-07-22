import footerTemplate from './footer.html?raw'
import './footer.css'
import { ref, onMounted } from 'vue'
import footerMessages from '../../i18n/footer.js'  // 导入语言文件

export default {
  name: 'FooterComponent',
  template: footerTemplate,
  setup() {
    const lang = ref('en')  // 默认英文
    
    // 翻译函数
    const t = (key) => footerMessages[lang.value]?.[key] || key

    onMounted(() => {
      // 初始化语言设置
      lang.value = window.currentLang || 'en'
      
      // 监听语言变化事件
      window.addEventListener('languagechange', () => {
        lang.value = window.currentLang || 'en'
      })
    })

    return {
      t  // 暴露翻译函数给模板使用
    }
  }
}