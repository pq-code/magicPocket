<script setup lang='ts'>
import { onMounted, onBeforeUnmount, ref } from 'vue'
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
import { createDemoCustomerFormPageRoot } from '@renderer/type/page-node'

const store = useDraggingDraggingStore()
const { pageJSON, currentCodeConfigId, currentCodeConfigName } = storeToRefs(store)
const route = useRoute()
const lengthWidth = ref(true)
const { init, dispose } = useCanvasOperation()

/** 页面文件保存后：重新应用 CSS 并执行页面脚本，使编辑内容立即生效 */
const onPageConfigSaved = () => {
  applyPageCss()
  runPageScript()
}

const mousedown = (e) => {
  console.log('鼠标右键', e)
}

let pageStyleEl: HTMLStyleElement | null = null
let pageBeforeUnmountHandler: ((page: unknown) => void) | null = null

const applyPageCss = () => {
  const css = pageJSON.value.css || ''
  if (!pageStyleEl) {
    pageStyleEl = document.createElement('style')
    pageStyleEl.setAttribute('data-lowcode-page-style', 'true')
    document.head.appendChild(pageStyleEl)
  }
  pageStyleEl.innerHTML = css
}

/** 执行页面脚本：Vue setup 风格，优先 script，兼容旧 hooks.onMounted */
const runPageScript = () => {
  const code = pageJSON.value.script ?? pageJSON.value.hooks?.onMounted
  if (!code || typeof code !== 'string') return

  const refs = {} as Record<string, unknown>

  const onMounted = (fn: () => void) => {
    try {
      fn()
    } catch (e) {
      console.warn('执行页面 onMounted 回调失败:', e)
    }
  }

  const onBeforeUnmount = (fn: (page: unknown) => void) => {
    if (typeof fn === 'function') {
      pageBeforeUnmountHandler = fn
    }
  }

  try {
    /** 用户脚本可写：
     * onMounted(() => { console.log(pageJSON) })
     * onBeforeUnmount(() => { ... })
     */
    const fn = new Function('pageJSON', 'onMounted', 'onBeforeUnmount', 'refs', code)
    fn(pageJSON.value, onMounted, onBeforeUnmount, refs)
  } catch (e) {
    console.warn('执行页面脚本失败:', e)
  }
}

onMounted(() => {
  init()

  // 如果是示例页面，则直接使用本地示例 JSON，不请求后端
  if (route.query.demo === 'customer-form') {
    pageJSON.value = createDemoCustomerFormPageRoot()
    // 示例页：应用页面 CSS 并执行页面脚本
    applyPageCss()
    runPageScript()
    return
  }

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
      applyPageCss()
      runPageScript()
    }
  }).catch((err) => {
    console.warn('加载配置失败，使用默认空画布:', err)
  })
})

onBeforeUnmount(() => {
  dispose()
  if (pageBeforeUnmountHandler) {
    try {
      pageBeforeUnmountHandler(pageJSON.value)
    } catch (e) {
      console.warn('执行页面 onBeforeUnmount 回调失败:', e)
    }
  }
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
        <draggingDraggingMain @saved="onPageConfigSaved"></draggingDraggingMain>
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
