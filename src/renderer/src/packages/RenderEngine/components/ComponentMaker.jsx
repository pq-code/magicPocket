
import style from '../style/ComponentMaker.module.less';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import { VueDraggable } from 'vue-draggable-plus'

const ComponentMaker = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => { },
    },
    item: {
      type: Object,
      default: () => { },
    },
  },
  model: {
    prop: "modelValue",
    event: "update:modelValue",
  },

  setup(props, { emit, slots }) {
    const store = useDraggingDraggingStore();
    const { pageJSON, currentOperatingObject } = storeToRefs(store);

    /**
    * 删除对象
    *
    * @returns 无返回值
    */
    const deleteObject = () => {
      if (!currentOperatingObject.value) {
        console.error("当前操作对象为空，无法删除");
        return;
      }

      for (let i = 0; i < pageJSON.value.children.length; i++) {
        if (pageJSON.value.children[i]?.key == currentOperatingObject.value.key) {
          pageJSON.value.children.splice(i, 1);
          currentOperatingObject.value = null
          break;
        }
        depthFirstSearchAndDelete(pageJSON.value.children[i], currentOperatingObject.value.key) // 深层查找
      }
    };
    /**
     * 点击容器函数
     * 标记选中对象，提供选中对象进行编辑
     * @param e 事件对象
     * @returns 无返回值
     */
    const clickContainer = (e) => {
      e.stopPropagation();
      currentOperatingObject.value = props.item;
    };

    /**
     * 处理鼠标进入事件
     *
     * @param e 事件对象
     */
    function handleMouseEnter(e) {
      // 阻止事件冒泡
      e.stopPropagation();
      if (!e.currentTarget?.classList.contains(style.SelectedHighlighted)) {
        e.currentTarget?.classList.add(style.HoverHighlighted);
      }
    }

    /**
     * 处理鼠标离开事件
     *
     * @param e 事件对象
     */
    function handleMouseLeave(e) {
      // 阻止事件冒泡
      e.stopPropagation();
      e.currentTarget?.classList.remove(style.HoverHighlighted);
    }

    // 渲染结果缓存
    const renderResult = computed(() => renderRootVnode());

    const renderRootVnode = () => {
      let row = []

      // 如果当前操作对象的 key 等于当前组件的 key，则渲染删除按钮 否则渲染组件名称
      if (currentOperatingObject.value?.key == props.item?.key) {
        row.push(<div
          className={style.ComponentTag}>
          <i
            class="iconfont icon-lajitong5"
            onClick={deleteObject}
          ></i>
        </div>)
      } else {
        row.push(<span className={style.ComponentTag}>{props.item?.componentName}</span>)
      }
      return (
        <VueDraggable
          vModel={props.item}
          group = {{ name: "people", pull: true, put: true }}
          ghostClass="ghost"
          chosenClass="chosen"
          selector="selector"
          animation={200}        // 动画延迟
          sort={true}            // 是否可推拽排序
        >
          <div
            className={[
              style.Container,
              currentOperatingObject.value?.key == props.item?.key ? style.SelectedHighlighted : ' '].filter(Boolean).join(' ')}
            onClick={clickContainer}
            onMouseenter={handleMouseEnter}
            onMouseleave={handleMouseLeave}
          >
            {/* 选择工具 */}
            {row}
            {/* 默认插槽 */}
            {slots.default ? slots.default() : null}
          </div>
        </VueDraggable>
      )
    }

    return () => renderResult.value;
  },
});

export default ComponentMaker;
