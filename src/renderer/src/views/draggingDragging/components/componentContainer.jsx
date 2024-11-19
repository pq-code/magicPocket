import { defineComponent, ref, watch, onMounted } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useDraggingDraggingStore } from "@renderer/stores/draggingDragging/useDraggingDraggingStore.ts";

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

    const init = () => {};

    const onClone = (e) => {
      console.log(e);
    };

    const onStart = (e) => {
      currentDragObject = e.clonedData;
    };

    const handleEnd = (e) => {
      console.log(e);
    };

    const selectComponents = (e) => {
      console.log(e);
    };
    // 克隆方法
    const handleClone = (e) => {
      console.log(e,e.item,componentContainerSon.value);
    };

    onMounted(() => {
      init();
    });

    return () => (
      <VueDraggable
        className="componentContainer"
        vModel={componentContainerSon.value}
        animation={150}
        // option={group:{ name: "people", pull: "clone", put: false }}
        group = {{ name: "people", pull: "clone", put: false }}
        sort={false}
        onStart={onStart}
        onClone={handleClone}
      >
        {componentContainerSon.value.map((item, index) => {
          return (
            <div
              key={`${item.componentName}_${index}`}
              className="componentContainerSon"
              onClick={selectComponents}
            >
              <i class="iconfont icon-yibiaopan"></i>
              {item.componentName}
            </div>
          );
        })}
      </VueDraggable>
    );
  },
});

export default componentContainer;
