<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import draggingDraggingL from '@renderer/views/draggingDragging/components/draggingDraggingL.jsx'
import draggingDraggingMain from '@renderer/views/draggingDragging/components/draggingDraggingMain.jsx'
import draggingDraggingR from '@renderer/views/draggingDragging/components/draggingDraggingR.jsx'
import draggingDraggingHead from '@renderer/views/draggingDragging/components/draggingDraggingHead.jsx'
import useCanvasOperation from './hooks/useCanvasOperation'
import { getCodeConfig } from '@renderer/api/apis/lowCode/lowCode'
import './style/draggingDraggingL.less'
import { storeToRefs } from 'pinia'
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore'

const store = useDraggingDraggingStore()
const { pageJSON, currentCodeConfigId, currentCodeConfigName } = storeToRefs(store)
const route = useRoute()
const lengthWidth = ref(true)
const { init } = useCanvasOperation()

const mousedown = (e) => {
  console.log('鼠标右键', e)
}

onMounted(() => {
  init()
  // 支持通过路由 query 传入 codeConfigId/codeConfigName 覆盖默认值
  const queryId = route.query.codeConfigId
  const queryName = route.query.codeConfigName
  if (queryId && typeof queryId === 'string') currentCodeConfigId.value = queryId
  if (queryName && typeof queryName === 'string') currentCodeConfigName.value = queryName

  getCodeConfig({
    codeConfigName: currentCodeConfigName.value,
    codeConfigId: currentCodeConfigId.value,
  }).then((res) => {
    if (res.result?.codeConfig) {
      pageJSON.value = res.result.codeConfig
    }
  }).catch((err) => {
    console.warn('加载配置失败，使用默认空画布:', err)
  })
})
</script>
<template>
  <div class="draggingDragging" @contextmenu.prevent='mousedown'>
    <div class="draggingDragging-head">
      <draggingDraggingHead></draggingDraggingHead>
    </div>

    <div class="draggingDragging-center">
      <div class="draggingDragging-l" :style="{ maxWidth: lengthWidth ? '320px' : '80px', minHeight : '80px'}">
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
    height: calc(100% - 50px);
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
      width: 270px;
      height: 100%;
      background: #ffff;
    }
  }
 }
</style>
