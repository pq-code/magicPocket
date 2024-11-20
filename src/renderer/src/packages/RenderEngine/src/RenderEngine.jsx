import { defineComponent, ref, watch, nextTick, computed } from 'vue';
import style from '../style/index.module.less';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import { VueDraggable } from 'vue-draggable-plus'
import { typeRender } from "../components/TypeRenderEngine"
import { storeToRefs } from 'pinia'
import useCanvasOperation from '@renderer/views/draggingDragging/hooks/useCanvasOperation.ts'
import ComponentMaker from '../components/ComponentMaker.jsx'

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
    const { addHistoryOperatingObject } = useCanvasOperation()

    const store = useDraggingDraggingStore();
    const { pageJSON } = storeToRefs(store); // 页面数据
    const whetherYouCanDrag = computed(() => pageJSON.value.whetherYouCanDrag); //
    const componentList = ref(pageJSON.value?.children || []) // 组件列表

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
    const nodeClone = (e) => {
      console.log(e)
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
            className={style.PageContainer}
            style=''
            vModel={componentList.value}
            group = {{ name: "people", pull: true, put: true }}
            ghostClass="ghost"
            chosenClass="chosen"
            selector="selector"
            animation={200}        // 动画延迟
            sort={true}            // 是否可推拽排序
          >
            {
              renderComponent.length ?
                renderComponent.map(e =>
                  <ComponentMaker {...e.props}>
                    {e}
                  </ComponentMaker>)
                : null
            }
          </VueDraggable>
          : (<div className='root'>
              {renderComponent}
            </div>)
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
      // 给DOM赋予唯一标识
      item.key = `${item.type}-${Number(Math.random() * 10000).toFixed(0)}`
      return typeRender(item, children)
    }

    watch(()=>props.modelValue,()=> {
      addHistoryOperatingObject()
    })

    // 渲染结果缓存
    const renderResult = computed(() => renderRootVnode());

    return () => (
      // 容器
      renderResult.value
    );
  },
});

export default RenderEngine;
