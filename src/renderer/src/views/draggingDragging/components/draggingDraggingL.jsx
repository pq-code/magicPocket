import { defineComponent, ref, watch, onMounted } from 'vue';
import componentContainer from './componentContainer'
import '../style/draggingDraggingL.less'
import { Search } from '@element-plus/icons-vue'

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

    const handleChange = () => {

    }
    const init = () => {

    }
    onMounted(() => {
      init()
    });

    return () => (
      <div className='draggingDraggingL'>
        <div className='draggingDraggingL-title'> 组件库 </div>
        <div className='draggingDraggingL-main'>
          <ElInput placeholder="搜索组件库" suffix-icon={Search} > </ElInput>
          <div className='draggingDraggingL-container'>
          <ElCollapse vModel={activeNames} onChange={handleChange}>
              <ElCollapseItem title="表单组件" name="1">
              <componentContainer></componentContainer>
            </ElCollapseItem>
          </ElCollapse>
          </div>
        </div>
      </div>
    );
  },
});

export default draggingDraggingL;
