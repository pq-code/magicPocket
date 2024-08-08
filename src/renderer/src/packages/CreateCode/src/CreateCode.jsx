import { defineComponent, ref, watch, onMounted } from 'vue';
import { ElRow,ElForm,ElTooltip, ElFormItem, ElCol, ElCollapse,ElCollapseItem, ElSelect, ElOption, ElInput } from 'element-plus';

const CreateCode = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {}
    },
    pageJSON: {
      type: Object,
      default: () => {}
    },
    children: {
      type: Array,
      default: () => []
    },
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const handleClose = () => {
      emit('update:modelValue', false);
    }
    return () => (
      <ElDrawer
      vModel={props.modelValue}
      title="代码生成"
        direction='rtl'
        size='50%'
      before-close={handleClose}
      >
        <div className='ElDrawer-heard'>
          <ElButton type= 'primary' text='primary'>
            点击复制
          </ElButton>
        </div>
        <div className='ElDrawer-center'>
         
        </div>
    </ElDrawer>
    );
  },
});

export default CreateCode;
