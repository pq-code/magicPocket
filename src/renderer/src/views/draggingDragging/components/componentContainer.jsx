import { defineComponent, ref, watch, onMounted, computed } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useDraggingDraggingStore } from "@renderer/stores/draggingDragging/useDraggingDraggingStore.ts";
import { Table as BuiltinTableMeta } from "@renderer/packages/material";

import {
  ElRow,
  ElForm,
  ElTooltip,
  ElFormItem,
  ElCol,
  ElDatePicker,
  ElRadioGroup,
  ElRadio,
  ElSelect,
  ElOption,
  ElInput,
} from "element-plus";

const componentContainer = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {},
    },
    listData: {
      type: Array,
      default: () => [],
    },
    componentList: {
      type: Array,
      default: () => [],
    },
  },
  model: {
    prop: "modelValue",
    event: "update:modelValue",
  },
  setup(props, { emit }) {
    let { currentDragObject } = useDraggingDraggingStore();
    const inputValue = ref(props.modelValue);
    const isDisabled = false;

    const componentContainerSon = computed(() => props.componentList);

    const getSourceLabel = (source) => {
      if (source === 'platform') return '平台'
      if (source === 'local') return '本地'
      if (source === 'builtin') return '内置'
      return ''
    }

    const getSourceColor = (source) => {
      if (source === 'platform') return '#67c23a'
      if (source === 'local') return '#409eff'
      if (source === 'builtin') return '#909399'
      return '#c0c4cc'
    }

    const init = () => {};

    const selectComponents = (e) => {
      console.log(e);
    };

    // 克隆函数：确保拖拽到画布的组件包含完整的数据结构
    const cloneComponent = (original) => {
      // 表格：如果来源（平台/本地）未携带默认 data，则兜底用内置 Table meta 的示例数据
      const fallbackData =
        (original?.type === "table" || original?.type === "Table") &&
        !Array.isArray(original?.data) &&
        Array.isArray(BuiltinTableMeta?.data)
          ? BuiltinTableMeta.data
          : undefined;

      return {
        ...original,
        key: `${original.type}-${Math.random().toString(36).substr(2, 9)}`,
        children: original.children ? [...original.children] : [],
        ...(fallbackData ? { data: fallbackData } : {})
      };
    };

    onMounted(() => {
      init();
    });

    return () => (
      <VueDraggable
        className="componentContainer"
        vModel={componentContainerSon.value}
        animation={200}
        group = {{ name: "people", pull: "clone", put: false }}
        sort={false}
        clone={cloneComponent}
      >
        {componentContainerSon.value.map((item, index) => {
          const sourceLabel = getSourceLabel(item.materialSource)
          const sourceColor = getSourceColor(item.materialSource)
          return (
            <div
              id={item.key}
              key={`${item.componentName}_${index}`}
              className="componentContainerSon"
              onClick={selectComponents}
            >
              <div style="display:flex;align-items:center;gap:4px;">
                <i className={['iconfont', item.icon || 'icon-yibiaopan'].join(' ')}></i>
                <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  {item.componentName}
                </span>
                {sourceLabel && (
                  <span
                    style={`
                      font-size: 10px;
                      padding: 0 4px;
                      border-radius: 3px;
                      border: 1px solid ${sourceColor};
                      color: ${sourceColor};
                      line-height: 16px;
                      flex-shrink: 0;
                    `}
                  >
                    {sourceLabel}
                  </span>
                )}
              </div>
              {item.description && (
                <div
                  title={item.description}
                  style="margin-top:4px;font-size:10px;color:#909399;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
                >
                  {item.description}
                </div>
              )}
            </div>
          );
        })}
      </VueDraggable>
    );
  },
});

export default componentContainer;
