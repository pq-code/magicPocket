<script setup lang='ts'>
import { ref } from 'vue'
import draggingDraggingL from '@renderer/views/draggingDragging/components/draggingDraggingL.jsx'
import draggingDraggingMain from '@renderer/views/draggingDragging/components/draggingDraggingMain.jsx'
import draggingDraggingR from '@renderer/views/draggingDragging/components/draggingDraggingR.jsx'

import './style/draggingDraggingL.less'

const lengthWidth = ref(true);

</script>
<template>
  <div class="draggingDragging">
    <div class="draggingDragging-head">

    </div>

    <div class="draggingDragging-center">
      <div class="draggingDragging-l" :style="{ maxWidth: lengthWidth ? '320px' : '80px' }">
        <draggingDraggingL></draggingDraggingL>
      </div>
      <div class="draggingDragging-middle">
        <draggingDraggingMain></draggingDraggingMain>
      </div>
      <div class="draggingDragging-r">
        <draggingDraggingR></draggingDraggingR>
      </div>
    </div>
  </div>
</template>
<style scoped lang='less'>
 .draggingDragging {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  .draggingDragging-head {
    height: 50px;
  }
  .draggingDragging-center {
    display: flex;
    height: 100%;
    width: 100%;
    .draggingDragging-l {
      width: 300px;
      height: 100%;
      background: #ffff;
    }
    .draggingDragging-middle {
      flex: 1;
      height: 100%;
      background: #ebebeb;
    }
    .draggingDragging-r {
      width: 300px;
      height: 100%;
      background: #ffff;
    }
  }
 }
</style>
