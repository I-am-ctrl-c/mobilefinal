<template>
  <div class="min-h-screen bg-black flex items-center justify-center px-4 py-8 relative">
    <!-- 返回按钮（右下角） -->
    <button @click="goBack"
      class="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full shadow-lg z-50">
      ← Back
    </button>

    <!-- 视频播放器 -->
    <video controls autoplay class="w-full max-w-4xl rounded-lg shadow-xl">
      <source :src="$route.query.url" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  methods: {
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
video {
  max-height: 80vh;
}
</style>
