import { defineComponent, ref, watch, onMounted } from 'vue';
import '../style/index.less'
import PageContainer from '@renderer/packages/PageContainer/src/PageContainer.jsx'
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import { VueDraggable } from 'vue-draggable-plus'

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
    let componentList = ref(pageJSON.children || [])

    const handleEnd = (e) => {
      console.log(e)
      debugger
    }
    /**
     * 渲染根虚拟节点
     *
     * @returns 返回根虚拟节点
     */
    const renderRootVnode = (h) => {
      const _page = h;
      const renderedComponents = renderComponents(_page);
      // 渲染根目录
      return (
        <div className={`${_page.props?.className} root`}>
          {renderedComponents}
        </div>
      )
    }
    /**
     * 渲染组件
     *
     * @returns 渲染结果
     */
    const renderComponents = (_page) => {
      if (Array.isArray(componentList.value) && componentList.value.length > 0) {
        return componentList.value.map((child, index) => {
          const Component = child.type;
          const componentProps = child.props;
          return (
            startRender()
          );
        });
      } else if (whetherYouCanDrag) {
        return (
          <VueDraggable
            className='PageContainer'
            vModel={componentList.value}
            animation={150}
            group='people'
            sort='ture'
            onEnd={handleEnd}
          >
            <div>112121</div>
          </VueDraggable>
        )
      } else {
        return null
      }
    }
    /**
     * 开始渲染页面
     *
     * @returns 渲染后的页面组件
     */
    const startRender = () => {
      // 开发环境添加拖拽功能
      if (whetherYouCanDrag) {
        debugger
        return (
          <PageContainer pageJSON={componentList.value} children = {typeRender(componentList.value)}>
          </PageContainer>
        )
      } else {
        return typeRender(componentList.value);
      }
    }
    /**
     * 渲染类型
     *
     * @returns 渲染结果
     */
    const typeRender = (item) => {
      let returnElement
      switch (item.type) {
        case 'Form':
          returnElement = (generateForm(item,index))
          break;
         // 其他类型的处理
        default:
          returnElement = generateContainer(item, index)
          break;
      }
      return returnElement;
    }

    const generateForm = async (item, index) => {
      return (
        <Form key={item.key || index} pageJSON={item}>
          <PageContainer pageJSON={item.children}></PageContainer>
        </Form>
      )
    }

    const generateContainer = (item, index) => {
      return (
        <div key={item.key || index} className={item.props.className} style={item.props.style}>
          <PageContainer pageJSON={item.children}></PageContainer>
        </div>
      )
    }

    return () => (
      // 容器
      renderRootVnode(pageJSON)
    );
  },
});

export default RenderEngine;
