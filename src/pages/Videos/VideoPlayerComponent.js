import './VideoPlayer.css'

export default {
  name: 'VideoPlayerComponent',
  template: `
    <div class="min-h-screen bg-black flex items-center justify-center px-4 py-8 relative">
      <!-- 返回按钮（右下角） -->
      <button id="backButton"
        class="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full shadow-lg z-50">
        ← Back
      </button>

      <!-- 视频播放器 -->
      <video controls autoplay class="w-full max-w-4xl rounded-lg shadow-xl">
        <source id="videoSource" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  `,
  mounted() {
    // 设置视频源
    const videoSource = document.getElementById('videoSource');
    const urlParams = new URLSearchParams(window.location.search);
    const videoUrl = urlParams.get('url');
    if (videoUrl) {
      videoSource.src = videoUrl;
    }

    // 绑定返回按钮事件
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', this.goBack);
  },
  methods: {
    goBack() {
      this.$router.back();
    }
  }
}
