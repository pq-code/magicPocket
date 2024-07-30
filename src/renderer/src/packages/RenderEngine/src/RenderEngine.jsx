import { defineComponent, ref, watch, onMounted, computed } from 'vue';
import '../style/index.less'
import PageContainer from '@renderer/packages/PageContainer/src/PageContainer.jsx'
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import { VueDraggable } from 'vue-draggable-plus'
import { typeRender } from "../components/TypeRenderEngine"
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
    const { pageJSON, currentDragObject, currentEnvironment } = useDraggingDraggingStore()
    const whetherYouCanDrag = pageJSON.whetherYouCanDrag
    let componentList = ref(pageJSON.children)


    const handleEnd = (e) => {
      console.log(e)
     }
    /**
     * 渲染根虚拟节点
     *
     * @returns 返回根虚拟节点
     */
    const renderRootVnode = (h) => {
      let renderComponent = renderComponents(componentList.value)
      return (
        whetherYouCanDrag ?
          <VueDraggable
            style={{
              width: '100%',
              height: '100%'
            }}
            className='PageContainer'
            vModel={componentList.value}
            animation={150}
            group='people'
            sort='ture'
            onEnd={handleEnd}
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
      // 开发环境添加拖拽功能
      if (whetherYouCanDrag && item.type !== "container") {
        return <PageContainer pageJSON={item} children = { typeRender(item,children) } >
        </PageContainer>
      }
      return typeRender(item, children)
      // return whetherYouCanDrag ? <PageContainer pageJSON={item} children = { typeRender(item,children)} >
      //   </PageContainer> : typeRender(item, children)
    }

    // 渲染结果缓存
    const renderResult = computed(() =>renderRootVnode(componentList.value));

    return () => (
      // 容器
      renderResult.value
    );
  },
});

export default RenderEngine;
