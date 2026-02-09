import { defineComponent, ref, watch, onMounted, computed } from 'vue';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import { storeToRefs } from 'pinia'
import ControlPanel from '@renderer/internal/ControlPanel/src/controlPanel.jsx'

const draggingDraggingR = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => { }
    },
    // fileListMap: Object
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const store = useDraggingDraggingStore();
    const { pageJSON, currentOperatingObject } = storeToRefs(store);
    const draggingDraggingRRef = ref(null)

    // 创建一个唯一的 key，当选中对象变化时更新，强制重新渲染组件
    const panelKey = computed(() => {
      return currentOperatingObject.value?.key || 'empty';
    });

    const init = () => {}
    onMounted(() => {
      init()
    });

    const TypeRender = (item) => {
      return (
        // 使用 key 强制组件在切换时重新渲染
        <ControlPanel key={panelKey.value} item={item}></ControlPanel>
      )
    }

    const RenderEngine = (item) => {
      if (!item || JSON.stringify(item) == '{}') {
        return <div style={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}> <span style={
          {
            'text-align': 'center',
            'font-size': '23px',
            'font-weight': 600,
            color: 'rgb(51, 51, 51)',
            padding: '0px 5px',
            background: '-webkit-linear-gradient(315deg, rgb(66, 211, 146) 25%, rgb(100, 126, 255)) text',
            '-webkit-text-fill-color': 'transparent'
          }
        }>点击中间画布区域选中要操作的对象</span> </div>
      }

      return (
        <div className="draggingDraggingR">
          <div className="draggingDraggingR-content">
            <div
              ref={draggingDraggingRRef}
              className="draggingDraggingR-content-list"
            >
              {TypeRender(item)}
            </div>
          </div>
        </div>
      )
    }

    return () => (
      RenderEngine(currentOperatingObject.value)
    );
  },
});

export default draggingDraggingR;
