import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  MODEL_SIZE,
  PANEL_GAP,
  DOT_SIZE,
  PANEL_MIN_WIDTH,
  PANEL_MIN_HEIGHT,
  SNAP_GAP,
  PANEL_DEFAULT_WIDTH,
  PANEL_DEFAULT_HEIGHT,
} from './constants'

/** 人物圆 + 面板的拖拽/缩放/位置逻辑，与聊天内容解耦 */
export function useFloatingChatPosition() {
  const position = ref({ left: 0, bottom: 24 })
  const dragging = ref(false)
  const dragStart = ref({ x: 0, y: 0, left: 0, bottom: 0 })
  const dragMoved = ref(false)
  const resizing = ref(false)
  const resizeStart = ref({ x: 0, y: 0, width: PANEL_DEFAULT_WIDTH, height: PANEL_DEFAULT_HEIGHT })
  const panelSize = ref({ width: PANEL_DEFAULT_WIDTH, height: PANEL_DEFAULT_HEIGHT })

  function snapToEdge() {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = panelSize.value.width
    const h = panelSize.value.height
    let panelLeft = position.value.left - PANEL_GAP - w
    let panelBottom = position.value.bottom
    panelLeft = Math.max(SNAP_GAP, Math.min(panelLeft, vw - SNAP_GAP - w))
    panelBottom = Math.max(SNAP_GAP, Math.min(panelBottom, vh - SNAP_GAP - h))
    position.value.left = panelLeft + w + PANEL_GAP
    position.value.bottom = panelBottom
  }

  const modelStyle = computed(() => ({
    left: `${position.value.left}px`,
    bottom: `${position.value.bottom}px`,
    width: `${MODEL_SIZE}px`,
    height: `${MODEL_SIZE}px`,
  }))

  const modelDotStyle = computed(() => ({
    left: `${position.value.left + MODEL_SIZE - DOT_SIZE / 2}px`,
    bottom: `${position.value.bottom + MODEL_SIZE - DOT_SIZE / 2}px`,
    width: `${DOT_SIZE}px`,
    height: `${DOT_SIZE}px`,
  }))

  const chatPanelStyle = computed(() => {
    const w = panelSize.value.width
    const h = panelSize.value.height
    const vw = window.innerWidth
    const vh = window.innerHeight
    let panelLeft = position.value.left - PANEL_GAP - w
    let panelBottom = position.value.bottom
    panelLeft = Math.max(SNAP_GAP, Math.min(panelLeft, vw - SNAP_GAP - w))
    panelBottom = Math.max(SNAP_GAP, Math.min(panelBottom, vh - SNAP_GAP - h))
    return {
      left: `${panelLeft}px`,
      bottom: `${panelBottom}px`,
      width: `${w}px`,
      height: `${h}px`,
    }
  })

  const pastePreviewHeight = computed(() =>
    Math.max(32, Math.round(panelSize.value.height * 0.1))
  )

  function initPosition() {
    position.value.left = window.innerWidth - 24 - MODEL_SIZE
    position.value.bottom = 24
  }

  function onModelPointerDown(e: PointerEvent) {
    if ((e.target as HTMLElement).closest('.floating-chat__panel')) return
    dragging.value = true
    dragMoved.value = false
    dragStart.value = {
      x: e.clientX,
      y: e.clientY,
      left: position.value.left,
      bottom: position.value.bottom,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onModelPointerUp(e: PointerEvent) {
    if (!dragging.value) return
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch (_) {}
    dragging.value = false
  }

  function onResizePointerDown(e: PointerEvent) {
    e.stopPropagation()
    resizing.value = true
    resizeStart.value = {
      x: e.clientX,
      y: e.clientY,
      width: panelSize.value.width,
      height: panelSize.value.height,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onResizePointerUp(e: PointerEvent) {
    resizing.value = false
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch (_) {}
    snapToEdge()
  }

  function onGlobalPointerMove(e: PointerEvent) {
    if (resizing.value) {
      const dx = e.clientX - resizeStart.value.x
      const dy = e.clientY - resizeStart.value.y
      const vw = window.innerWidth
      const vh = window.innerHeight
      let w = Math.round(resizeStart.value.width - dx)
      let h = Math.round(resizeStart.value.height - dy)
      w = Math.max(PANEL_MIN_WIDTH, Math.min(w, vw - 40))
      h = Math.max(PANEL_MIN_HEIGHT, Math.min(h, vh - 40))
      panelSize.value = { width: w, height: h }
      return
    }
    if (!dragging.value) return
    const dx = e.clientX - dragStart.value.x
    const dy = e.clientY - dragStart.value.y
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragMoved.value = true
    const left = dragStart.value.left + dx
    const bottom = Math.max(0, dragStart.value.bottom - dy)
    const maxLeft = window.innerWidth - MODEL_SIZE
    position.value.left = Math.max(0, Math.min(left, maxLeft))
    position.value.bottom = Math.min(window.innerHeight - MODEL_SIZE, bottom)
    snapToEdge()
  }

  function onGlobalPointerUp() {
    if (resizing.value) {
      resizing.value = false
      snapToEdge()
    }
    if (dragging.value) {
      dragging.value = false
      snapToEdge()
    }
  }

  onMounted(() => {
    initPosition()
    window.addEventListener('pointermove', onGlobalPointerMove)
    window.addEventListener('pointerup', onGlobalPointerUp)
    window.addEventListener('pointercancel', onGlobalPointerUp)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onGlobalPointerMove)
    window.removeEventListener('pointerup', onGlobalPointerUp)
    window.removeEventListener('pointercancel', onGlobalPointerUp)
  })

  return {
    position,
    panelSize,
    dragging,
    dragMoved,
    resizing,
    modelStyle,
    modelDotStyle,
    chatPanelStyle,
    pastePreviewHeight,
    initPosition,
    onModelPointerDown,
    onModelPointerUp,
    onResizePointerDown,
    onResizePointerUp,
    onGlobalPointerMove,
    onGlobalPointerUp,
    snapToEdge,
  }
}
