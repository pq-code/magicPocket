<script setup lang="ts">
/**
 * 低代码预览页：模拟正式环境仅展示画布内容
 * - 编辑页点击「预览」后同窗口路由跳转，写入 localStorage，此处读取
 * - 仅渲染画布（无左侧/右侧面板、无拖拽），并执行页面 script/css
 */
import { onMounted, onBeforeUnmount, ref, nextTick, provide } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

/** 供 RenderEngine、DlockContainer 等注入，强制禁用拖拽/选中，不依赖 store */
provide('lowcodePreviewMode', true)
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore'
import RenderEngine from '@renderer/internal/RenderEngine/src/RenderEngine.jsx'
import type { PageRoot } from '@renderer/type/page-node'
import { ElButton } from 'element-plus'

const PREVIEW_STORAGE_KEY = 'lowcode_preview_page'

const router = useRouter()
const store = useDraggingDraggingStore()
const { pageJSON } = storeToRefs(store)
const hasData = ref(false)
const loadError = ref('')
let pageStyleEl: HTMLStyleElement | null = null
let pageBeforeUnmountHandler: ((page: unknown) => void) | null = null

const applyPageCss = (page: PageRoot) => {
  const css = page.css || ''
  if (!pageStyleEl) {
    pageStyleEl = document.createElement('style')
    pageStyleEl.setAttribute('data-lowcode-page-style', 'true')
    document.head.appendChild(pageStyleEl)
  }
  pageStyleEl.innerHTML = css
}

const runPageScript = (page: PageRoot) => {
  const code = page.script ?? page.hooks?.onMounted
  if (!code || typeof code !== 'string') return

  const refs = {} as Record<string, unknown>
  const onMounted = (fn: () => void) => {
    try {
      fn()
    } catch (e) {
      console.warn('预览页执行 onMounted 失败:', e)
    }
  }
  const onBeforeUnmountFn = (fn: (p: unknown) => void) => {
    if (typeof fn === 'function') pageBeforeUnmountHandler = fn
  }
  try {
    const fn = new Function('pageJSON', 'onMounted', 'onBeforeUnmount', 'refs', code)
    fn(page, onMounted, onBeforeUnmountFn, refs)
  } catch (e) {
    console.warn('预览页执行页面脚本失败:', e)
  }
}

function applyPreviewData(raw: string) {
  try {
    const page = JSON.parse(raw) as PageRoot
    page.whetherYouCanDrag = false
    pageJSON.value = page
    applyPageCss(page)
    runPageScript(page)
    loadError.value = ''
    // 等 store 写入后再显示画布，避免 RenderEngine 拿到空的 children
    nextTick(() => {
      hasData.value = true
    })
  } catch (e) {
    console.error('解析预览数据失败:', e)
    loadError.value = '预览数据解析失败'
  }
}

const backToEditor = () => {
  router.push({ name: 'draggingDragging' })
}

onMounted(() => {
  const raw = localStorage.getItem(PREVIEW_STORAGE_KEY)
  if (raw) {
    applyPreviewData(raw)
  } else {
    loadError.value = '未找到预览数据，请从编辑页点击「预览」打开。'
  }
})

onBeforeUnmount(() => {
  if (pageBeforeUnmountHandler) {
    try {
      pageBeforeUnmountHandler(pageJSON.value)
    } catch (e) {
      console.warn('预览页 onBeforeUnmount 失败:', e)
    }
  }
})
</script>

<template>
  <div class="lowcode-preview">
    <div v-if="hasData" class="lowcode-preview-bar">
      <ElButton type="primary" size="small" @click="backToEditor">返回编辑</ElButton>
    </div>
    <div v-if="!hasData" class="lowcode-preview-empty">
      {{ loadError || '正在加载预览…' }}
      <ElButton class="mt-2" type="primary" size="small" @click="backToEditor">返回编辑</ElButton>
    </div>
    <RenderEngine v-else :key="pageJSON?.title ?? 'preview'" />
  </div>
</template>

<style scoped>
/* 预览 = 模拟生产环境：不可拖拽、不可选中组件、无编辑态样式 */
.lowcode-preview {
  width: 100vw;
  min-height: 100vh;
  overflow: auto;
  background: #fff;
  user-select: text; /* 仅允许选中文本，与正式页一致 */
}
.lowcode-preview :deep(.ghost),
.lowcode-preview :deep(.chosen),
.lowcode-preview :deep(.selected-highlighted),
.lowcode-preview :deep(.hover-highlighted),
.lowcode-preview :deep([class*="SelectedHighlighted"]),
.lowcode-preview :deep([class*="HoverHighlighted"]),
.lowcode-preview :deep(.ComponentTag) {
  display: none !important;
}
.lowcode-preview-bar {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 10;
}
.lowcode-preview-empty {
  padding: 20px;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.mt-2 { margin-top: 8px; }
</style>
