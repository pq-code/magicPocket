import { defineComponent, ref, watch, onMounted } from 'vue';
import TypeRenderer from '@renderer/packages/TypeRenderer/src/TypeRenderer.jsx'

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
    const inputValue = ref(props.modelValue);
    onMounted(() => {
    });
    return () => (
      <div className='draggingDraggingMain'>
        <TypeRenderer></TypeRenderer>
      </div>
    );
  },
});

export default draggingDraggingMain;
