import { defineComponent, ref, watch, onMounted } from 'vue';
import '../style/index.less'
import PageContainer from '@renderer/packages/PageContainer/src/PageContainer.jsx'
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
    const page = ref(null)
    /**
     * 渲染根虚拟节点
     *
     * @returns 返回根虚拟节点
     */
    const renderRootVnode = () => {
      const _page = props.modelValue;
      const renderedComponents = renderComponents(_page);
      // 渲染根目录
      return (
        <div className='root'>
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
      const { children } = _page || [];
      return children?.map((child, index) => {
        const Component = child.type;
        const componentProps = child.props;

        return startRender()
      });
    }
    /**
     * 开始渲染
     *
     * @returns 无返回值
     */
    const startRender = () => {

    }

    return () => (
      // 容器
      renderRootVnode()
    );
  },
});

export default RenderEngine;
