import { defineComponent, ref, watch, onMounted } from 'vue';
import RenderEngine from '@renderer/packages/RenderEngine/src/RenderEngine.jsx'

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
        <RenderEngine></RenderEngine>
      </div>
    );
  },
});

export default draggingDraggingMain;
