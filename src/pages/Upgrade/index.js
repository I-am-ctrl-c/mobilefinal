import template from './upgrade.html?raw'
import upgradeMessages from '../../i18n/upgrade.js'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import { ref, onMounted } from 'vue'

export default {
  name: 'Upgrade',
  components: { NavBar, Footer },
  template,
  setup() {
    const lang = ref(window.currentLang || 'en')

    const t = (key) => upgradeMessages[lang.value]?.[key] || key

    const updateModalTexts = () => {
      const modalIds = ['paymentTitle', 'paymentSubtext', 'paymentHint', 'confirmPaymentBtn']
      modalIds.forEach((id) => {
        const el = document.getElementById(id)
        if (el) {
          el.textContent = t(idMap[id])
        }
      })
    }

    const idMap = {
      paymentTitle: 'paymentTitle',
      paymentSubtext: 'scanToPay',
      paymentHint: 'paymentHint',
      confirmPaymentBtn: 'confirmPayment'
    }

    const openPaymentModal = () => {
      const modal = document.getElementById('paymentModal')
      if (modal) modal.classList.remove('hidden')
    }

    const closePaymentModal = () => {
      const modal = document.getElementById('paymentModal')
      if (modal) modal.classList.add('hidden')
    }

    const confirmPayment = () => {
      alert(t('paymentSuccess'))
      closePaymentModal()
    }

    onMounted(() => {
      updateModalTexts()

      const closeBtn = document.getElementById('closeModalBtn')
      const confirmBtn = document.getElementById('confirmPaymentBtn')

      if (closeBtn) closeBtn.addEventListener('click', closePaymentModal)
      if (confirmBtn) confirmBtn.addEventListener('click', confirmPayment)

      window.addEventListener('languagechange', () => {
        lang.value = window.currentLang || 'en'
        updateModalTexts()
      })
    })

    return {
      t,
      openPaymentModal,
      closePaymentModal
    }
  }
}
