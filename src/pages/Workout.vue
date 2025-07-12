<template>
  <!-- 图片外层容器 -->
  <div class="text-white text-3xl">This is the Profile Page</div>
  

<div class="relative mt-8 -mx-8 sm:-mx-16 md:-mx-24 lg:-mx-32 xl:-mx-48">
  <!-- 背景图片 -->
  <img
    src="@/assets/images/Workout.jpg"
    alt="Workout Banner"
    class="w-screen h-auto object-cover"
  />

  <!-- 叠加文字：绝对定位居中 -->
  <div class="absolute inset-0 flex items-center justify-center">
    <h2 class="text-white text-4xl font-bold bg-black bg-opacity-50 px-6 py-3 rounded">
      Welcome to XGYM Workout
    </h2>
  </div>
</div>


  <div class="pt-20">
    <Footer />
  </div>
</template>

<script>
export default {
  name: "Workout",
};
</script>

<script setup>
import Footer from '../components/Footer.vue'
</script>
