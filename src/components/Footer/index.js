import footerTemplate from './footer.html?raw'
import './footer.css'

import messages from '../../i18n/footerMessage.js'

export default {
  name: 'FooterComponent',
    // 声明从父组件接收一个 reactive 的 lang
  props: ['lang'],
  template: footerTemplate,
  setup(props) {
// 直接根据 props.lang 取文案
    const t = key => messages[props.lang]?.[key] || key
    return { t }
  }
} 





