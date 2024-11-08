import { defineComponent, ref, watch, onMounted } from 'vue';
import DlockContainer from '@renderer/packages/DlockContainer/src/DlockContainer.jsx'
import { ElRow, ElForm, ElTooltip, ElFormItem, ElCol, ElCollapse, ElCollapseItem, ElSelect, ElOption, ElInput, ElButton } from 'element-plus';
import { http } from '@renderer/api';

const From = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => { }
    },
    item: {
      type: Object,
      default: () => { }
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
  setup(props, { emit, slots }) {
    const inputValue = ref({});
    const handleChange = () => {

    }

    const structure = (item) => {
      if (item.cols) {
      }
    }

    // 标题属性
    const formProps = computed(() => {
      let value = {}
      props.item.props?.formProps?.children.forEach(item => {
        value[item.key] = item.value
      })
      return value
    })

    const submit = () => {
      const getCodeConfig = (params) => {
        return http.post(formProps.value.api, params);
      };
      getCodeConfig({ ...inputValue.value }).then(res => {
        console.log(res)
      })
    }

    const renderComponent = () => {
      const isReadOnly = formProps.value.isReadOnly;
      const formChildren = isReadOnly
        ? props.item.children.map((e, index) => {
          const item = e.props.formItemProps;
          return (
            <ElCol key={index} span={Number(formProps.value?.span) || 8}>
              <ElFormItem label={item.label}>
                <div>{e.props.formItemProps.value}</div>
              </ElFormItem>
            </ElCol>
          );
        })
        : props.children.map((e, index) => {
          const item = e.props;
          return (
            <ElCol key={index} span={Number(formProps.value?.span) || 8}>
              <ElFormItem label={item.label}>
                {e}
              </ElFormItem>
            </ElCol>
          );
        });

      const form = <ElForm vModel={inputValue.value} ref="formRef" >
        <ElRow gutter={formProps.value?.gutter || 20}>{formChildren}</ElRow>
      </ElForm>;
      const button = []
      if (formProps.value.isSubmit) {
        button.push(<ElButton type="primary" onClick={submit}>搜索</ElButton>)
      }
      if (formProps.value.isReset) {
        button.push(<ElButton>重置</ElButton>)
      }
      if (formProps.value.isSubmit || formProps.value.isReset) {
        formChildren.push(
          <div style={{ padding: '0 10px' }}>{button}</div>
        )
      }
      return (<DlockContainer item={props.item} children= {
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
