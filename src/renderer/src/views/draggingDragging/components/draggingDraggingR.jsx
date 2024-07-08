import { defineComponent, ref, watch, onMounted } from 'vue';

import { ElRow,ElForm,ElTooltip, ElFormItem, ElCol, ElCollapse,ElCollapseItem, ElSelect, ElOption, ElInput } from 'element-plus';

const draggingDraggingL = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {}
    },
    // fileListMap: Object
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const activeNames = ref([])
    const inputValue = ref(props.modelValue);

    const init = () => {

    }
    onMounted(() => {
      init()
    });

    return () => (
      <div className='draggingDraggingR'>
        <div>
          
        </div>
      </div>
    );
  },
});

export default draggingDraggingL;
