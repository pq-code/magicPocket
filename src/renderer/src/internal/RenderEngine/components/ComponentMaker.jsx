import style from '../style/ComponentMaker.module.less';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts';
import { VueDraggable } from 'vue-draggable-plus';
import { ref, computed, defineComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { ElTooltip } from 'element-plus';
import useCanvasOperation from '@renderer/views/draggingDragging/hooks/useCanvasOperation.ts';

const ComponentMaker = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    item: {
      type: Object,
      default: () => ({}),
    },
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },

  setup(props, { slots }) {
    const store = useDraggingDraggingStore();
    const { pageJSON, currentOperatingObject } = storeToRefs(store);
    const { deleteSelectedNode } = useCanvasOperation();

    const deleteObject = (e) => {
      e?.stopPropagation?.();
      // 统一走删除逻辑：写入历史栈，支持撤回
      deleteSelectedNode();
    };

    const clickContainer = (e) => {
      e.stopPropagation();
      e.preventDefault();

      // 确保只选择当前组件，避免嵌套选择混淆
      // 通过检查事件目标是否为当前组件容器来确保精确选择
      const targetElement = e.currentTarget;
      if (targetElement) {
        // 清除任何可能的父级选中状态
        currentOperatingObject.value = props.item;
      }
    };

    // 仅在最顶层（鼠标直接悬停的节点）显示悬停边框，父节点不显示
    const handleMouseOver = (e) => {
      const el = e.currentTarget;
      if (!el) return;
      const isDirectHover = e.target === el;
      if (isDirectHover && !el.classList.contains(style.SelectedHighlighted)) {
        el.classList.add(style.HoverHighlighted);
      } else {
        el.classList.remove(style.HoverHighlighted);
      }
    };

    const handleMouseLeave = (e) => {
      e.currentTarget?.classList.remove(style.HoverHighlighted);
    };

    const isCurrentOperatingObject = computed(
      () => currentOperatingObject.value?.key === props.item?.key
    );

    const renderComponentTag = () => {
      if (isCurrentOperatingObject.value) {
        return (
          <div className={style.ComponentTag} style={{ 'z-index': 100 }}>
            <i class="iconfont icon-lajitong5" onClick={deleteObject}></i>
          </div>
        );
      } else {
        return <span className={style.ComponentTag}>{props.item?.componentName}</span>;
      }
    };

    const renderRootVnode = () => {
      return (
        <VueDraggable
          vModel={props.item}
          group={{ name: 'people', pull: true, put: true }}
          ghostClass="ghost"
          chosenClass="chosen"
          selector="selector"
          animation={200}
          sort={true}
        >
          <ElTooltip
            class="box-item"
            effect="light"
            content={props.item?.componentName}
            placement="right"
          >
            {{
              reference: () => renderComponentTag(),
              default: () => (
                <div
                  className={[
                    style.Container,
                    isCurrentOperatingObject.value ? style.SelectedHighlighted : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={clickContainer}
                  onMouseover={handleMouseOver}
                  onMouseleave={handleMouseLeave}
                >
                  {slots.default ? slots.default() : null}
                </div>
              ),
            }}
          </ElTooltip>
        </VueDraggable>
      );
    };

    const renderResult = computed(() => renderRootVnode());

    return () => renderResult.value;
  },
});

export default ComponentMaker;

