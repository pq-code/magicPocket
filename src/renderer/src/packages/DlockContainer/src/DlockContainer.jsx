import { defineComponent, ref, watch, nextTick, computed } from 'vue';
import PageContainer from '@renderer/packages/PageContainer/src/PageContainer.jsx'
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import { storeToRefs } from 'pinia'

const DlockContainer = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {}
    },
    item: {
      type: Array,
      default: () => []
    },
    children: {
      type: Array,
      default: () => []
    }
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  /**
   * 设置组件
   *
   * @param props 组件属性
   * @param emit 触发事件函数
   * @returns 返回渲染函数
   */
  setup(props, { emit }) {
    const store = useDraggingDraggingStore();
    const { pageJSON,currentOperatingObject } = storeToRefs(store);

    /**
     * 点击容器函数
     * 标记选中对象，提供选中对象进行编辑
     * @param e 事件对象
     * @returns 无返回值
     */
    const clickContainer = (e) => {
      console.log(props.item, e, pageJSON.value)
      debugger
      // 如果选中的对象不为空，则清除选中对象的高亮标记
      if (currentOperatingObject.value) {
        document.getElementById(currentOperatingObject.value.key).classList.remove('selected-highlighted');
      }
      currentOperatingObject.value = props.item
      e.currentTarget?.classList.add('selected-highlighted');
    }

    /**
     * 处理鼠标进入事件
     *
     * @param e 事件对象
     */
    function handleMouseEnter(e) {
      if (!e.currentTarget?.classList.contains('selected-highlighted')) {
        e.currentTarget?.classList.add('hover-highlighted');
      }
    }

    /**
     * 处理鼠标离开事件
     *
     * @param e 事件对象
     */
    function handleMouseLeave(e) {
      e.currentTarget?.classList.remove('hover-highlighted');
    }

    const renderComponent = () => {
      return (
        <div
          id={props.item.key}
          key={props.item.key}
          className={props.item.props.className}
          style={props.item.props.style}
          onClick={clickContainer}
          onMouseenter={handleMouseEnter}
          onMouseleave={handleMouseLeave}
        >
          <PageContainer pageJSON={props.item} children={props.children}></PageContainer>
        </div>
      )
    }
    const vnode = computed(() => {
      return renderComponent()
    })

    return () => (
      vnode.value
    );
  },
});

export default DlockContainer;
