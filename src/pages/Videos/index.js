export default {
  name: 'VideoPlayer',
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
      window.history.back();
    }
  }
}
