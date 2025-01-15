<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import { io } from "socket.io-client";
import { SocketUtils } from "@renderer/utils/socket";

const localStrem = ref({
  video: {},
  audio: {}
}); // 本地流
const baseStrem = ref({
  video: {},
  audio: {}
}); // 传输流

const localStremPlayVideo = ref(null);
const baseStremPlayVideo = ref(null);
const cameraStream = ref();
const socketUtils = ref();
const socket = ref();
const socketId = ref();
const onlineNumber = ref(); // 获取当前连接人数
const userId = ref(Math.floor(Math.random() * (99999999 - 0 + 1)) + 0);
const target = ref();
const connection = ref();
// 获取本地视频流
function getVideos() {
    // 初始化 发起会议请求
    socketUtils.value.sendMessage({
      userId:userId.value,
      target: target.value,
      data: {type: "linkStart"},
    });
}
// 本地getVideos
const settVideos = () => {
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // 视频采集
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          frameRate: { ideal: 60 }
        },
      })
      .then(async (stream: MediaStream) => {
        console.log("getUserMedia success", stream.getTracks())
        cameraStream.value = stream
        localStremPlayVideo.value.srcObject =  stream
        setupWebRTC() // 收集视频流之后开始连接
      })
      .catch((onError) => {
        console.error(onError);
      });
  } else {
    console.error("浏览器不支持 mediaDevices 或 getUserMedia");
  }
}
// 初始化 WebRTC 连接
async function setupWebRTC() {
  // 创建 RTCPeerConnection 实例
  connection.value = new RTCPeerConnection();

  // 添加视频轨道
  let tracks = cameraStream.value.getTracks()
  console.log(tracks)
  if (tracks.length > 0) {
    connection.value.addTrack(tracks[0], cameraStream.value);
  }

   // 监听 轨道变化 track 事件
  connection.value.ontrack = (event) => {
    if (event.track.kind === "video") {
      baseStremPlayVideo.value.srcObject = event.streams[0];
    }
    if (event.track.kind === "audio") {
    }
  };

  // 监听 ICE候选地址 icecandidate 事件
  connection.value.onicecandidate = (event) => {
    if (event.candidate) {
      SendOut({ type: "candidate", candidate: event.candidate
      });
    }
  };

  try {
    // 发送方 创建 offer
    const offer = await connection.value.createOffer();
     await connection.value.setLocalDescription(offer);
    // 推送 offer
    SendOut(offer);
  } catch (error) {
    console.error("Error in WebRTC setup:", error);
  }
}

//接收到offer sdp时，创建answer并设置为本地描述
async function handleOffer(message) {
  let offer = message.data
  target.value = message.userId // 发送方用户id
  try {
    if( !connection.value) {
      settVideos()
    } else {
       connection.value.setRemoteDescription(offer) // 设置远端描述
      // 接收到offer sdp时，创建answer并设置为本地描述
      let answer = await connection.value.createAnswer()
      await connection.value.setLocalDescription(answer)
      SendOut(answer);
    }
  } catch (error) {
    console.error("Error adding ice offer:", error);
  }
}

// 处理接收到的 answer
const handleAnswer= async(message) => {
  let answer = message.data // 候选人信息
  target.value = message.userId // 发送方用户id
  try {
     // 创建 RTCSessionDescription 对象
    const rtcAnswer = new RTCSessionDescription(answer);
    // 设置远程描述
    await connection.value.setRemoteDescription(rtcAnswer);
  } catch (error) {
    console.error("Error setting remote description:", error);
  }
}

// 处理接收到的 ice candidate
const handleCandidate = async (message) => {
  let candidate = message.data.candidate;
  target.value = message.userId // 发送方用户id
  try {
    // 创建 RTCIceCandidate 对象
    const iceCandidate = new RTCIceCandidate({
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    });

    // 将候选地址添加到远程对等体的 RTCPeerConnection 中
    await connection.value.addIceCandidate(iceCandidate);

    console.log("ICE candidate added successfully");
  } catch (error) {
    console.error("Error adding ICE candidate:", error);
  }
};

// 假设这是从信令服务器接收到的消息处理函数
function handleMessage(message) {
  target.value = message.userId // 发送方用户id
  if(message.data.type === 'linkStart') {
    settVideos(); // 收到请求之后开启摄像头
  }
  if(message.data.type === 'offer') {
    handleOffer(message)
  }
  //当作为发起方时，收到answer sdp则设置为远端描述
  if (message.data.type === 'answer') {
     handleAnswer(message)
  }
  //当收到候选人信息时，将候选人信息加入到连接中
  else if (message.data.type === 'candidate') {
     handleCandidate(message);
  }
}

// 关闭摄像头
const cancellation = () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((element) => {
      console.log(element);
      element.stop();
    });
  }
  cameraStream.value = null;
  socketUtils.value.linkEnd();
};

onMounted(() => {
  // // 创建 RTCPeerConnection 对象，用于建立连接
  // connection.value = new RTCPeerConnection();

  socketUtils.value = new SocketUtils(userId.value);
  socket.value = socketUtils.value.linkStart(); // 创建连接
  // socketId.value = socketUtils.value.getSocketId();
  // socketUtils.value.joinRoom(userId.value) // 加入房间

  socket.value.on("message", (e) => {
    console.log("接收到最新消息", e);
    handleMessage(e.result);
  });
});

// 接收视频流
// const answerFn = async () => {
//   // 发送方 创建 offer
//   const answer = await connection.value.createAnswer();
//   await connection.value.setLocalDescription(answer);
// };

onUnmounted(() => {
  cancellation();
});
// 发送消息
const SendOut = (value) => {
  const message = {
    user: "嫩叠",
    userId: userId.value,
    socketId: socketId.value,
    data: value,
    target: target.value,
  };
  socketUtils.value.sendMessage(message);
};
</script>

<template>
  <div class="webRtc">
    <div class="video">
      <div class="video-box">
        <video
          width="100%"
          height="100%"
          ref="localStremPlayVideo"
          id="localStremPlayVideo"
          autoplay
          muted
        ></video>
      </div>

      <div class="video-box">
        <video
          width="100%"
          height="100%"
          ref="baseStremPlayVideo"
          id="baseStremPlayVideo"
          autoplay
          muted
        ></video>
      </div>

      <div>
        当前ID : {{ userId }}
        <el-input
          v-model="target"
          placeholder="请输入需要连接的用户名"
        ></el-input>
        <!-- <el-button>连接</el-button> -->
        <el-button id="getVideo" @click="getVideos()">获取视频</el-button>
        <el-button id="cancellation" @click="cancellation()"
          >关闭摄像头</el-button
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.webRtc {
  height: calc(100% - 60px);
  width: calc(100% - 60px);
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  .video {
    height: 300px;
    width: 700px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    .video-box {
      width: 600px;
      height: 300px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
