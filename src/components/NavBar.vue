<template>
  <header
    :class="[ 
      'fixed top-0 left-0 w-full z-50 transition-all duration-300',
      isScrolled ? 'bg-black shadow-md' : 'bg-transparent'
    ]"
  >
  <nav class="max-w-7xl mx-auto flex items-center justify-between px-6 py-5 text-white text-lg">
      <div class="text-xl font-bold">XGYM</div>
      <ul class="flex space-x-6">
        <li v-for="item in navItems" :key="item.path">
          <router-link
            :to="item.path"
            class="pb-1 transition duration-300 border-b-2"
            :class="[
              isActive(item.path)
                ? 'text-primaryPurple border-primaryPurple'
                : 'text-white border-transparent hover:text-primaryPurple hover:border-primaryPurple'
            ]"
          >
            {{ item.label }}
          </router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const isScrolled = ref(false)
const route = useRoute()

const navItems = [
  { label: 'Home', path: '/home' },
  { label: 'Schedule', path: '/schedule' },
  { label: 'Booking', path: '/booking' },
  { label: 'Workout', path: '/workout' },
  { label: 'Profile', path: '/profile' }
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

const isActive = (path) => route.path === path

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
a {
  transition: color 0.2s ease;
}
</style>
