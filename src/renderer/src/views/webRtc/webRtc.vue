<script setup lang="ts">
import { ref } from 'vue'

const playVideo = ref()
const cameraStream = ref()

// 获取本地视频流
function getVideos() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true
    })
    .then((stream: MediaStream) => {
      console.log(playVideo.value)
      cameraStream.value = stream
      playVideo.value.srcObject = stream
    })
    .catch((onError) => {
      console.error(onError)
    })
}

// 关闭摄像头
const cancellation = () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((element) => {
      console.log(element)
      element.stop()
    })
  }

  cameraStream.value = null
}
</script>

<template>
  <div class="webRtc">
    <video ref="playVideo" id="playVideo" autoplay muted></video>
    <el-button id="getVideo" @click="getVideos()">获取视频</el-button>
    <el-button id="cancellation" @click="cancellation()">关闭摄像头</el-button>
  </div>
</template>

<style scoped lang="less">
.webRtc {
  height: 100%;
  width: 100%;
}
</style>
