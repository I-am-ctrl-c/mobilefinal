<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <!-- 👇 这里加了 bg-darkBg 和 min-h-screen -->
  <div class="bg-darkBg min-h-screen text-white">
    <NavBar />
    <main class="pt-16">
      <RouterView />
    </main>
  </div>
</template>
