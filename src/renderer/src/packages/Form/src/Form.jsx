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

    onMounted(() => {
      init()
    });

    return () => (
      <ElForm>
        <ElRow>
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
        </ElRow>
      </ElForm>
    );
  },
});

export default From;
