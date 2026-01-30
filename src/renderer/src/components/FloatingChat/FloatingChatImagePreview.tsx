import { defineComponent, PropType, Teleport, Transition } from 'vue'

export default defineComponent({
  name: 'FloatingChatImagePreview',
  props: {
    url: {
      type: String as PropType<string | null>,
      default: null,
    },
    onClose: {
      type: Function as PropType<() => void>,
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
            class="floating-chat__image-preview-mask"
            style={{ display: props.url ? 'flex' : 'none' }}
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
            {props.url && (
              <img
                src={props.url}
                alt="放大查看"
                class="floating-chat__image-preview-img"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </Transition>
      </Teleport>
    )
  },
})
