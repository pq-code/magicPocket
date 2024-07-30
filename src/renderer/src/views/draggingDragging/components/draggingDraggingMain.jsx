import { defineComponent, ref, watch, onMounted } from 'vue';
import RenderEngine from '@renderer/packages/RenderEngine/src/RenderEngine.jsx'
import { buildUUID } from "@renderer/utils"
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
    const rootJSON = ref(props.modelValue);
    onMounted(() => {
    });

    return () => (
      <div className='draggingDraggingMain'>
        <RenderEngine key={ rootJSON.id || buildUUID() } {...rootJSON} ></RenderEngine>
      </div>
    );
  },
});

export default draggingDraggingMain;
