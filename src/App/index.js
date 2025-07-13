import appTemplate from './app.html?raw'
import NavBar from '../components/NavBar'
import { RouterView } from 'vue-router'

export default {
  name: 'AppRoot',
  components: { NavBar, RouterView },
  template: appTemplate
} 