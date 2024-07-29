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
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const inputValue = ref(props.modelValue);
    const handleChange = () => {

    }
    const init = () => {

    }

    const structure = (item) => {
      if (item.cols) {
        
      }
    }

    onMounted(() => {
      init()
      debugger
    });
    // rules={props.pageJSON.props.rules}
    // labelWidth={props.pageJSON.props.labelWidth || '120px'}
    // labelPosition={props.pageJSON.props.labelPosition || 'top'}
    // className={props.pageJSON.props.className || 'form'}
    return () => (
      <ElForm vModel={formData}
        ref="formRef"
        {...props.pageJSON}
       >
        {
          structure(props.pageJSON)
        }
        {/* <ElRow>
          <ElCol span={8}>
            <ElFormItem label='选项1'>
              <ElInput></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol span={8}>
          <ElFormItem label='选项2'>
              <ElInput></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol span={8}>
            <ElFormItem label='选项3'>
              <ElSelect></ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow> */}
      </ElForm>
    );
  },
});

export default From;
