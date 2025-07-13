import homeTemplate from './home.html?raw'
import Footer from '../../components/Footer'
import NavBar from '../../components/NavBar'

export default {
  name: 'HomePage',
  components: { NavBar, Footer },
  template: homeTemplate
}
