<!-- src/pages/Home.vue -->
<template>
  <div class="text-white text-3xl">This is the Booking Page</div>
  
  <div class="pt-20">
    <Footer />
  </div>
  
</template>

<script>
export default {
  name: "Booking",
};
</script>

<script setup>
import Footer from '../components/Footer.vue'
</script>