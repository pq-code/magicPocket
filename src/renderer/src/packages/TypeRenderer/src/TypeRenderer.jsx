import { defineComponent, ref, watch, onMounted } from 'vue';
import '../style/index.less'
import PageContainer from '@renderer/packages/PageContainer/src/PageContainer.jsx'
const TypeRenderer = defineComponent({
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
    onMounted(() => {
    });

    return () => (
      // 容器
      <div className='StructuralContainer'>
        {/* 页面容器 */}
        <PageContainer></PageContainer>
      </div>
    );
  },
});

export default TypeRenderer;
