import { defineComponent, ref, watch, onMounted } from 'vue';
import Structuralcontainer from '@renderer/packages/Structuralcontainer/src/Structuralcontainer.jsx'

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
        <Structuralcontainer></Structuralcontainer>
      </div>
    );
  },
});

export default draggingDraggingMain;
