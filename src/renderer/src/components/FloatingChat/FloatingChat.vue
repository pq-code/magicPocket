<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const MODEL_SIZE = 60
const PANEL_GAP = 12

/** 圆（开关）的位置：左边距、下边距，可拖动到任意位置 */
const position = ref({ left: 0, bottom: 24 })

const showChat = ref(false)
const showAgentConfig = ref(false)
/** 设置弹窗左侧当前选中的分类 */
const agentConfigActiveTab = ref<'agent'>('agent')
/** Agent 常用设置（可后续持久化） */
const agentSettings = ref({
  systemNotify: true,
  completionSound: false,
  autoExpandReply: true,
})
const messages = ref<{ id: number; text: string; isUser: boolean }[]>([])
const inputText = ref('')
const nextId = ref(0)

/** 拖动状态 */
const dragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, bottom: 0 })
const dragMoved = ref(false)

const modelStyle = computed(() => ({
  left: `${position.value.left}px`,
  bottom: `${position.value.bottom}px`,
  width: `${MODEL_SIZE}px`,
  height: `${MODEL_SIZE}px`,
}))

const PANEL_WIDTH = 320

/** 对话在左、圆在右，下边对齐：面板在圆的左侧，底部与圆一致 */
const chatPanelStyle = computed(() => ({
  left: `${Math.max(PANEL_GAP, position.value.left - PANEL_GAP - PANEL_WIDTH)}px`,
  bottom: `${position.value.bottom}px`,
}))

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

function onGlobalPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const dx = e.clientX - dragStart.value.x
  const dy = e.clientY - dragStart.value.y
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragMoved.value = true
  const left = dragStart.value.left + dx
  const bottom = Math.max(0, dragStart.value.bottom - dy)
  const maxLeft = window.innerWidth - MODEL_SIZE
  position.value.left = Math.max(0, Math.min(left, maxLeft))
  position.value.bottom = Math.min(window.innerHeight - MODEL_SIZE, bottom)
}

function onGlobalPointerUp() {
  dragging.value = false
}

function toggleChat() {
  if (dragMoved.value) {
    dragMoved.value = false
    return
  }
  showChat.value = !showChat.value
}

function send() {
  const text = inputText.value.trim()
  if (!text) return
  messages.value.push({ id: nextId.value++, text, isUser: true })
  inputText.value = ''
  // 可在此处接入 AI 回复
  setTimeout(() => {
    messages.value.push({
      id: nextId.value++,
      text: '收到：' + text,
      isUser: false,
    })
  }, 300)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
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
</script>

<template>
  <div class="floating-chat">
    <!-- 人物模型（圆）：可拖动到任意位置，点击打开/关闭对话 -->
    <div
      class="floating-chat__model"
      :style="modelStyle"
      :class="{ 'is-dragging': dragging }"
      role="button"
      aria-label="打开对话"
      @pointerdown="onModelPointerDown"
      @pointerup="onModelPointerUp"
      @click="toggleChat"
    >
      <div class="floating-chat__model-inner" />
    </div>

    <!-- 聊天窗口：固定在其左侧，下边与圆对齐 -->
    <Transition name="floating-chat-panel">
      <div
        v-show="showChat"
        class="floating-chat__panel"
        :style="chatPanelStyle"
      >
        <div class="floating-chat__panel-header">
          <span class="floating-chat__panel-title">对话</span>
          <div class="floating-chat__panel-header-actions">
            <button
              type="button"
              class="floating-chat__panel-btn floating-chat__panel-btn--settings"
              aria-label="设置"
              title="设置"
              @click="showAgentConfig = true"
            >
              <i class="iconfont icon-Tab_shezhi" />
            </button>
            <button
              type="button"
              class="floating-chat__panel-btn floating-chat__panel-btn--close"
              aria-label="关闭"
              title="关闭"
              @click="showChat = false"
            >
              <i class="iconfont icon-guanbi" />
            </button>
          </div>
        </div>
        <div class="floating-chat__panel-messages">
          <template v-if="messages.length === 0">
            <div class="floating-chat__empty">输入消息开始对话</div>
          </template>
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="floating-chat__message"
            :class="{ 'floating-chat__message--user': msg.isUser }"
          >
            <div class="floating-chat__message-avatar" />
            <div class="floating-chat__message-bubble">{{ msg.text }}</div>
          </div>
        </div>
        <div class="floating-chat__panel-input-wrap">
          <input
            v-model="inputText"
            type="text"
            class="floating-chat__panel-input"
            placeholder="输入消息..."
            @keydown="handleKeydown"
          />
          <button type="button" class="floating-chat__panel-send" @click="send">
            发送
          </button>
        </div>
      </div>
    </Transition>

    <!-- Agent 配置弹窗：左右布局，右上角关闭 -->
    <Teleport to="body">
      <Transition name="agent-config-fade">
        <div
          v-show="showAgentConfig"
          class="floating-chat__agent-config-mask"
          @click.self="showAgentConfig = false"
        >
          <div class="floating-chat__agent-config">
            <div class="floating-chat__agent-config-side">
              <div
                class="floating-chat__agent-config-nav-item"
                :class="{ 'is-active': agentConfigActiveTab === 'agent' }"
                @click="agentConfigActiveTab = 'agent'"
              >
                Agent 设置
              </div>
            </div>
            <div class="floating-chat__agent-config-main">
              <div class="floating-chat__agent-config-header">
                <span class="floating-chat__agent-config-title">
                  {{ agentConfigActiveTab === 'agent' ? 'Agent 设置' : '标题' }}
                </span>
                <button
                  type="button"
                  class="floating-chat__agent-config-close"
                  aria-label="关闭"
                  title="关闭"
                  @click="showAgentConfig = false"
                >
                  <i class="iconfont icon-guanbi" />
                </button>
              </div>
              <div class="floating-chat__agent-config-content">
                <template v-if="agentConfigActiveTab === 'agent'">
                  <div class="floating-chat__agent-config-section">
                    <div class="floating-chat__agent-config-row">
                      <span class="floating-chat__agent-config-label">系统通知</span>
                      <span class="floating-chat__agent-config-desc">Agent 完成或需要关注时显示系统通知</span>
                      <label class="floating-chat__agent-config-toggle">
                        <input v-model="agentSettings.systemNotify" type="checkbox" />
                        <span class="floating-chat__agent-config-switch" />
                      </label>
                    </div>
                    <div class="floating-chat__agent-config-row">
                      <span class="floating-chat__agent-config-label">完成提示音</span>
                      <span class="floating-chat__agent-config-desc">Agent 回复结束时播放提示音</span>
                      <label class="floating-chat__agent-config-toggle">
                        <input v-model="agentSettings.completionSound" type="checkbox" />
                        <span class="floating-chat__agent-config-switch" />
                      </label>
                    </div>
                    <div class="floating-chat__agent-config-row">
                      <span class="floating-chat__agent-config-label">自动展开回复</span>
                      <span class="floating-chat__agent-config-desc">收到回复时自动展开内容</span>
                      <label class="floating-chat__agent-config-toggle">
                        <input v-model="agentSettings.autoExpandReply" type="checkbox" />
                        <span class="floating-chat__agent-config-switch" />
                      </label>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped lang="less">
.floating-chat {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  & > * {
    pointer-events: auto;
  }
}

.floating-chat__model {
  position: fixed;
  border-radius: 12px;
  background: #e8e8e8;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  user-select: none;
  &:hover:not(.is-dragging) {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
  &.is-dragging {
    cursor: grabbing;
  }
}

.floating-chat__model-inner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f7f7f7;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}

.floating-chat__panel {
  position: fixed;
  width: 320px;
  max-width: calc(100vw - 120px);
  height: 400px;
  max-height: calc(100vh - 120px);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.floating-chat__panel-header {
  flex-shrink: 0;
  min-height: 44px;
  padding: 8px 12px 8px 16px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.floating-chat__panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.floating-chat__panel-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.floating-chat__panel-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #666;
  transition: background 0.2s, color 0.2s;
  .iconfont {
    font-size: 16px;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #333;
  }
}

/* Agent 配置弹窗：左右布局 */
.floating-chat__agent-config-mask {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.floating-chat__agent-config {
  width: 100%;
  max-width: 640px;
  height: 420px;
  max-height: 80vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  display: flex;
  overflow: hidden;
}

.floating-chat__agent-config-side {
  width: 160px;
  flex-shrink: 0;
  padding: 12px 0;
  background: #f5f5f5;
  border-right: 1px solid #eee;
}

.floating-chat__agent-config-nav-item {
  padding: 10px 16px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #eee;
    color: #333;
  }
  &.is-active {
    background: #e8e8e8;
    color: #333;
    font-weight: 500;
  }
}

.floating-chat__agent-config-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.floating-chat__agent-config-header {
  flex-shrink: 0;
  height: 48px;
  padding: 0 12px 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0f0f0;
  border-bottom: 1px solid #eee;
}

.floating-chat__agent-config-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.floating-chat__agent-config-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #666;
  transition: background 0.2s, color 0.2s;
  .iconfont {
    font-size: 18px;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #333;
  }
}

.floating-chat__agent-config-content {
  flex: 1;
  padding: 16px;
  background: #fafafa;
  overflow: auto;
}

.floating-chat__agent-config-section {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.floating-chat__agent-config-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  &:last-child {
    border-bottom: none;
  }
}

.floating-chat__agent-config-label {
  flex: 0 0 100%;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.floating-chat__agent-config-desc {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.floating-chat__agent-config-toggle {
  flex-shrink: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
}

.floating-chat__agent-config-switch {
  display: inline-block;
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: #ccc;
  transition: background 0.2s;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
  }
}

.floating-chat__agent-config-toggle input:checked + .floating-chat__agent-config-switch {
  background: #42d392;
  &::after {
    transform: translateX(18px);
  }
}

.agent-config-fade-enter-active,
.agent-config-fade-leave-active {
  transition: opacity 0.2s ease;
}
.agent-config-fade-enter-from,
.agent-config-fade-leave-to {
  opacity: 0;
}

.floating-chat__panel-close-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
}

.floating-chat__panel-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.floating-chat__empty {
  color: #999;
  font-size: 13px;
  text-align: center;
  padding: 24px 0;
}

.floating-chat__message {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  &.floating-chat__message--user {
    flex-direction: row-reverse;
    .floating-chat__message-bubble {
      background: #f0f0f0;
      color: #333;
    }
  }
}

.floating-chat__message-avatar {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f7f7f7;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.floating-chat__message-bubble {
  max-width: 220px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.45;
  background: #f0f0f0;
  color: #555;
  border-radius: 10px;
  word-break: break-word;
}

.floating-chat__panel-input-wrap {
  flex-shrink: 0;
  padding: 12px;
  background: #fafafa;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
  align-items: center;
}

.floating-chat__panel-input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  font-size: 13px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #f0f0f0;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  &::placeholder {
    color: #999;
  }
  &:focus {
    border-color: #c0c0c0;
    background: #fff;
  }
}

.floating-chat__panel-send {
  flex-shrink: 0;
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: #555;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #333;
  }
}

.floating-chat-panel-enter-active,
.floating-chat-panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.floating-chat-panel-enter-from,
.floating-chat-panel-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
