import { defineComponent, ref, watch, onMounted } from 'vue';

import { ElRow,ElForm,ElTooltip, ElFormItem, ElCol, ElCollapse,ElCollapseItem, ElSelect, ElOption, ElInput } from 'element-plus';

const From = defineComponent({
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
    const inputValue = ref(props.modelValue);
    const handleChange = () => {

    }

    const structure = (item) => {
      if (item.cols) {
      }
    }
    return () => (
      <ElForm vModel={props.modelValue}
        ref="formRef"
        {...props.pageJSON}
       >
        <ElRow>
        {
            props.children.map(e => {
            let pageJSON = e.props
            console.log(e)
            debugger
            return (
              <ElCol span={pageJSON.span || 8}>
              <ElFormItem label={pageJSON.label}>
                {e}
              </ElFormItem>
            </ElCol>
            )
          })
        }
        </ElRow>
      </ElForm>
    );
  },
});

export default From;
