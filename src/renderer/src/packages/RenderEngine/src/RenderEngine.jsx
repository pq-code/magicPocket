import { defineComponent, ref, watch, nextTick, computed } from 'vue';
import '../style/index.less'
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import { VueDraggable } from 'vue-draggable-plus'
import { typeRender } from "../components/TypeRenderEngine"
import { storeToRefs } from 'pinia'
import canvasOperation from '@renderer/views/draggingDragging/hooks/canvasOperation.ts'

const RenderEngine = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {}
    },
    listData: {
      type: Array,
      default: () => []
    }
    // fileListMap: Object
  },

  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },

  setup(props, { emit }) {
    const { addHistoryOperatingObject } = canvasOperation()

    const store = useDraggingDraggingStore();
    const { pageJSON } = storeToRefs(store);
    const whetherYouCanDrag = computed(() => pageJSON.value.whetherYouCanDrag);
    const componentList = ref(pageJSON.value?.children || [])

    watch(
      () => pageJSON.value,
      ({ children = [] }) => {
        componentList.value = children;
      },
      { deep: true }
    );

    watch (
      () => componentList.value,
      (newValue) => {
        if (newValue !== pageJSON.value.children) {
          pageJSON.value.children = newValue;
        }
      }
    );

    const handleEnd = (e) => {
      // 添加历史操作对象
      nextTick(() => {
        addHistoryOperatingObject()
      })
     }
    /**
     * 渲染根虚拟节点
     *
     * @returns 返回根虚拟节点
     */
    const renderRootVnode = () => {
      let renderComponent = renderComponents(componentList.value)
      return (
        whetherYouCanDrag ?
          <VueDraggable
            style={{ width: '100%', height: '100%' }}
            className='PageContainer'
            vModel={componentList.value}
            animation={150}
            group='people'
            sort='true'
            onAdd={handleEnd}
              >
             { renderComponent }
          </VueDraggable>
          : <div className='root'>
            {renderComponent}
          </div>
      )
    }
    /**
     * 渲染组件
     *
     * @returns 渲染结果
     */
    const renderComponents = (_page) => {
      if(!_page) return null
      if (Array.isArray(_page)) {
        return _page.map(child => {
          const children = Array.isArray(child.children) ? renderComponents(child.children) : [];
          return startRender(child, children);
        });
      } else {
        return (
          startRender(_page)
        );
      }
    }
    /**
     * 开始渲染页面
     *
     * @returns 渲染后的页面组件
     */
    const startRender = (item, children) => {
      return typeRender(item, children)
    }

    // 渲染结果缓存
    const renderResult = computed(() => renderRootVnode());

    return () => (
      // 容器
      renderResult.value
    );
  },
});

export default RenderEngine;
