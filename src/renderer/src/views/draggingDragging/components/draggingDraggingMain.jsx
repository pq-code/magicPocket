import { defineComponent, ref, watch, onMounted } from 'vue';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import structuralContainer from '@renderer/packages/structuralContainer'

import { ElRow,ElForm,ElTooltip, ElFormItem, ElCol, ElDatePicker, ElRadioGroup, ElRadio, ElSelect, ElOption, ElInput } from 'element-plus';

const draggingDraggingMain = defineComponent({
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
    const { pageJSON } = useDraggingDraggingStore()
    const inputValue = ref(props.modelValue);
    const init = () => {

    }
    onMounted(() => {
      init()
      console.log( useDraggingDraggingStore(),pageJSON)
      debugger
    });

    return () => (
      <div className='draggingDraggingMain'>
        {/* 预览用，内部装子容器 */}
        <div className='pageContainer'>
          <structuralContainer pageJSON={pageJSON}></structuralContainer>
        </div>
      </div>
    );
  },
});

export default draggingDraggingMain;
