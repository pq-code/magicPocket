import './FloatingChat.less'
import { defineComponent, ref, nextTick, Transition } from 'vue'
import FloatingChatImagePreview from './FloatingChatImagePreview'
import FloatingChatBubbleExpand from './FloatingChatBubbleExpand'
import FloatingChatAgentConfig from './FloatingChatAgentConfig'
import type { ChatMessage, AgentSettings } from './types'
import { useFloatingChatPosition } from './useFloatingChatPosition'

export default defineComponent({
  name: 'FloatingChat',
  setup() {
    const {
      dragging,
      dragMoved,
      modelStyle,
      modelDotStyle,
      chatPanelStyle,
      pastePreviewHeight,
      onModelPointerDown,
      onModelPointerUp,
      onResizePointerDown,
      onResizePointerUp,
    } = useFloatingChatPosition()

    const showChat = ref(false)
    const showAgentConfig = ref(false)
    const agentConfigActiveTab = ref<'agent'>('agent')
    const agentSettings = ref<AgentSettings>({
      systemNotify: true,
      completionSound: false,
      autoExpandReply: true,
    })
    const messages = ref<ChatMessage[]>([])
    const inputText = ref('')
    const nextId = ref(0)
    const agentStatus = ref<'online' | 'busy' | 'offline'>('offline')
    const pendingImages = ref<{ id: string; url: string }[]>([])
    const imagePreviewUrl = ref<string | null>(null)
    const expandedMessage = ref<ChatMessage | null>(null)
    const panelMessagesRef = ref<HTMLElement | null>(null)

    function openImagePreview(url: string) {
      imagePreviewUrl.value = url
    }
    function closeImagePreview() {
      imagePreviewUrl.value = null
    }
    function openBubbleExpand(msg: ChatMessage) {
      expandedMessage.value = msg
    }
    function closeBubbleExpand() {
      expandedMessage.value = null
    }
    function onBubbleClick(e: MouseEvent, msg: ChatMessage) {
      if ((e.target as HTMLElement).closest('.floating-chat__message-img')) return
      openBubbleExpand(msg)
    }
    function updateAgentSetting<K extends keyof AgentSettings>(key: K, value: boolean) {
      agentSettings.value[key] = value
    }
    function toggleChat() {
      if (dragMoved.value) {
        dragMoved.value = false
        return
      }
      showChat.value = !showChat.value
    }
    function scrollMessagesToBottom() {
      nextTick(() => {
        const el = panelMessagesRef.value
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      })
    }
    function send() {
      const text = inputText.value.trim()
      const images = pendingImages.value.map((i) => i.url)
      if (!text && images.length === 0) return
      messages.value.push({
        id: nextId.value++,
        text: text || '[图片]',
        isUser: true,
        images: images.length ? images : undefined,
      })
      inputText.value = ''
      pendingImages.value = []
      scrollMessagesToBottom()
      setTimeout(() => {
        messages.value.push({
          id: nextId.value++,
          text: '收到：' + (text || '图片'),
          isUser: false,
        })
        scrollMessagesToBottom()
      }, 300)
    }
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (!file) continue
          const url = URL.createObjectURL(file)
          pendingImages.value.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            url,
          })
          break
        }
      }
    }
    function removePendingImage(id: string) {
      const item = pendingImages.value.find((i) => i.id === id)
      if (item) URL.revokeObjectURL(item.url)
      pendingImages.value = pendingImages.value.filter((i) => i.id !== id)
    }
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        send()
      }
    }
    function onInputChange(e: Event) {
      inputText.value = (e.target as HTMLInputElement).value
    }

    return () => (
      <div class="floating-chat">
        <div
          class={['floating-chat__model-dot', `floating-chat__model-dot--${agentStatus.value}`]}
          style={modelDotStyle.value}
          aria-hidden="true"
        />
        <div
          class={['floating-chat__model', { 'is-dragging': dragging.value }]}
          style={modelStyle.value}
          role="button"
          aria-label="打开对话"
          onPointerdown={onModelPointerDown}
          onPointerup={onModelPointerUp}
          onClick={toggleChat}
        >
          <div class="floating-chat__model-inner" />
        </div>

        <Transition name="floating-chat-panel">
          <div
            class="floating-chat__panel"
            style={{
              ...chatPanelStyle.value,
              display: showChat.value ? undefined : 'none',
            }}
          >
            <div
              class="floating-chat__panel-resize-handle"
              aria-label="拖拽缩放"
              onPointerdown={onResizePointerDown}
              onPointerup={onResizePointerUp}
            />
            <div class="floating-chat__panel-header">
              <span class="floating-chat__panel-title">对话</span>
              <div class="floating-chat__panel-header-actions">
                <button
                  type="button"
                  class="floating-chat__panel-btn floating-chat__panel-btn--settings"
                  aria-label="设置"
                  title="设置"
                  onClick={() => (showAgentConfig.value = true)}
                >
                  <i class="iconfont icon-Tab_shezhi" />
                </button>
                <button
                  type="button"
                  class="floating-chat__panel-btn floating-chat__panel-btn--close"
                  aria-label="关闭"
                  title="关闭"
                  onClick={() => (showChat.value = false)}
                >
                  <i class="iconfont icon-guanbi" />
                </button>
              </div>
            </div>
            <div ref={panelMessagesRef} class="floating-chat__panel-messages">
              {messages.value.length === 0 ? (
                <div class="floating-chat__empty">输入消息开始对话</div>
              ) : (
                messages.value.map((msg) => (
                  <div
                    key={msg.id}
                    class={[
                      'floating-chat__message',
                      msg.isUser && 'floating-chat__message--user',
                    ]}
                  >
                    <div class="floating-chat__message-avatar" />
                    <div
                      class="floating-chat__message-bubble"
                      role="button"
                      tabindex={0}
                      onClick={(e) => onBubbleClick(e as unknown as MouseEvent, msg)}
                    >
                      {msg.images && msg.images.length > 0 && (
                        <div class="floating-chat__message-images">
                          {msg.images.map((src, idx) => (
                            <img
                              key={idx}
                              src={src}
                              alt=""
                              class="floating-chat__message-img"
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                openImagePreview(src)
                              }}
                            />
                          ))}
                        </div>
                      )}
                      {msg.text && <span>{msg.text}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div class="floating-chat__panel-input-area" onPaste={onPaste}>
              {pendingImages.value.length > 0 && (
                <div
                  class="floating-chat__panel-paste-preview"
                  style={{ maxHeight: `${pastePreviewHeight.value}px` }}
                >
                  {pendingImages.value.map((img) => (
                    <div key={img.id} class="floating-chat__panel-paste-item">
                      <img
                        src={img.url}
                        alt="粘贴的图片"
                        class="floating-chat__panel-paste-img"
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openImagePreview(img.url)
                        }}
                      />
                      <button
                        type="button"
                        class="floating-chat__panel-paste-remove"
                        aria-label="移除"
                        onClick={() => removePendingImage(img.id)}
                      >
                        <i class="iconfont icon-guanbi" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div class="floating-chat__panel-input-wrap">
                <input
                  type="text"
                  class="floating-chat__panel-input"
                  placeholder="输入消息或粘贴图片..."
                  value={inputText.value}
                  onInput={onInputChange}
                  onKeydown={handleKeydown}
                />
                <button type="button" class="floating-chat__panel-send" onClick={send}>
                  发送
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <FloatingChatImagePreview url={imagePreviewUrl.value} onClose={closeImagePreview} />
        <FloatingChatBubbleExpand
          message={expandedMessage.value}
          onClose={closeBubbleExpand}
          onOpenImagePreview={openImagePreview}
        />
        <FloatingChatAgentConfig
          visible={showAgentConfig.value}
          activeTab={agentConfigActiveTab.value}
          settings={agentSettings.value}
          onClose={() => (showAgentConfig.value = false)}
          onTabChange={(tab) => (agentConfigActiveTab.value = tab)}
          onSettingsUpdate={updateAgentSetting}
        />
      </div>
    )
  },
})
