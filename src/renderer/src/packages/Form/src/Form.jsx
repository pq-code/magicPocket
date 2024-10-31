import { defineComponent, ref, watch, onMounted } from 'vue';
import DlockContainer from '@renderer/packages/DlockContainer/src/DlockContainer.jsx'
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
    const inputValue = ref({});
    const handleChange = () => {

    }

    const structure = (item) => {
      if (item.cols) {
      }
    }

    const renderComponent = () => {
      const isReadOnly = props.pageJSON.props?.readOnly;
      const formChildren = isReadOnly
        ? props.pageJSON.children.map((e, index) => {
            const pageJSON = e.props.formItemProps;
            return (
              <ElCol key={index} span={Number(props.pageJSON.props.span) || 8}>
                <ElFormItem label={pageJSON.label}>
                  <div>{e.props.formItemProps.value}</div>
                </ElFormItem>
              </ElCol>
            );
          })
        : props.children.map((e, index) => {
            const pageJSON = e.props;
            return (
              <ElCol key={index} span={Number(props.pageJSON.props.span) || 8}>
                <ElFormItem label={pageJSON.label}>
                  {e}
                </ElFormItem>
              </ElCol>
            );
        });

      const form = (
        <ElForm vModel={inputValue.value} ref="formRef" >
          <ElRow gutter={Number(props.pageJSON.props.gutter) || 20}>{formChildren}</ElRow>
        </ElForm>
      );
      console.log(props.pageJSON,form)
      return (<DlockContainer item={props.pageJSON} children= {
        [form].filter(Boolean)
      } />)
    }

    const vnode = computed(() => {
      return renderComponent()
    })

    return () => (
      vnode.value
    );
  },
});

export default From;
