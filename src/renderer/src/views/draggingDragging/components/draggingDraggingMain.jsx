import { defineComponent, ref, watch, onMounted } from 'vue';
import RenderEngine from '@renderer/packages/RenderEngine/src/RenderEngine.jsx'
import { buildUUID } from "@renderer/utils"
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts';
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
    const store = useDraggingDraggingStore();
    const { pageJSON } = storeToRefs(store); // 页面数据

    const rootJSON = ref(props.modelValue);
    const dialogVisible = ref(false);
    onMounted(() => {
    });


    const renderRootVnode = computed(() => {
      return  <RenderEngine key={rootJSON.id || buildUUID()} {...rootJSON} ></RenderEngine>
    })

    const nodeJSON = ref(JSON.stringify(pageJSON.value))

    return () => (
      <div className='draggingDraggingMain'>
        <div className='connections'>
          <el-tooltip
            class="box-item"
            effect="dark"
            content="页面JSON结构"
            placement="top-start"
          >
            <ElButton text='primary' onClick={() => dialogVisible.value = true}>
              <i className='iconfont icon-connections'></i>
            </ElButton>
          </el-tooltip>
        </div>

        { renderRootVnode.value }

        <ElDialog
          vModel={dialogVisible.value}
          title="页面JSON结构"
          width="500"
          height="400"
        >
        </ElDialog>

        <div>
          <highlightjs
            language='javascript'
            code={nodeJSON.value}>
          </highlightjs>
        </div>
      </div>
    );
  },
});

export default draggingDraggingMain;
