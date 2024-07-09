import { defineComponent, ref, watch, onMounted } from 'vue';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import structuralContainer from '@renderer/packages/structuralContainer'
import { VueDraggable } from 'vue-draggable-plus'

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
    const renderComponentList = ref([])
    const inputValue = ref(props.modelValue);
    const init = () => {

    }
    const hasMessage = () => {
      const len = list2.value.length
      if (len > 3) {
        isDisabled.value = true
        ElMessage({
          showClose: true,
          message: '已经四张图片了',
          type: 'warning',
        })
      }
    }

    onMounted(() => {
      init()
      console.log( useDraggingDraggingStore(),pageJSON)
    });

    return () => (
      <div className='draggingDraggingMain'>
        {/* 预览用，内部装子容器 */}
        <div className='pageContainer'>
          <VueDraggable
            ref="pageContainer"
            vModel={renderComponentList.value}
            onAdd={hasMessage}
            group="people"
            animation="150">
          {/* <structuralContainer pageJSON={pageJSON.value}></structuralContainer> */}
        </VueDraggable>
        </div>
      </div>
    );
  },
});

export default draggingDraggingMain;
