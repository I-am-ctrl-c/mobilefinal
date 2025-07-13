<!-- src/pages/Workout.vue -->
<template>
 

  <!-- ✅ 图片区域，使用 aspect 实现宽高同比缩放 -->
  <div class="w-full aspect-[21/5] relative mt-6 overflow-hidden">
    <img
      src="../assets/images/Workout.jpg"
      class="w-full h-full object-cover"
      alt="Workout Image"
    />
    <!-- ✅ 图片中居中标题 + 黑色遮罩 -->
    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <h2 class="text-white text-4xl font-bold px-6 py-2 rounded">
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
