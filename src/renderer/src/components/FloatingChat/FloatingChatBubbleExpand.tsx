import { defineComponent, PropType, Teleport, Transition } from 'vue'

export interface BubbleExpandMessage {
  id: number
  text: string
  isUser: boolean
  images?: string[]
}

export default defineComponent({
  name: 'FloatingChatBubbleExpand',
  props: {
    message: {
      type: Object as PropType<BubbleExpandMessage | null>,
      default: null,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onOpenImagePreview: {
      type: Function as PropType<(url: string) => void>,
      required: true,
    },
  },
  setup(props) {
    const onMaskClick = (e: MouseEvent) => {
      if (e.target === e.currentTarget) props.onClose()
    }
    return () => (
      <Teleport to="body">
        <Transition name="image-preview-fade">
          <div
            class="floating-chat__bubble-expand-mask"
            style={{ display: props.message ? 'flex' : 'none' }}
            onClick={onMaskClick}
          >
            <button
              type="button"
              class="floating-chat__image-preview-close"
              aria-label="关闭"
              onClick={props.onClose}
            >
              <i class="iconfont icon-guanbi" />
            </button>
            {props.message && (
              <div class="floating-chat__bubble-expand-content">
                {props.message.images && props.message.images.length > 0 && (
                  <div class="floating-chat__bubble-expand-images">
                    {props.message.images.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt=""
                        class="floating-chat__bubble-expand-img"
                        onClick={(e) => {
                          e.stopPropagation()
                          props.onOpenImagePreview(src)
                        }}
                      />
                    ))}
                  </div>
                )}
                {props.message.text && (
                  <p class="floating-chat__bubble-expand-text">{props.message.text}</p>
                )}
              </div>
            )}
          </div>
        </Transition>
      </Teleport>
    )
  },
})
