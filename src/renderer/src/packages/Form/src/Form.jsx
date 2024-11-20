import { defineComponent, ref, watch, onMounted } from 'vue';
import { ElRow, ElForm, ElTooltip, ElFormItem, ElCol, ElCollapse, ElCollapseItem, ElSelect, ElOption, ElInput, ElButton } from 'element-plus';
import { http } from '@renderer/api';
import useCodeConfig from '@renderer/views/draggingDragging/hooks/useCodeConfig.ts';

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
    const { collectProps } = useCodeConfig();

    let Api = ''
    const inputValue = ref({});
    const formRef = ref(null)
    onMounted(() => {
      props.item.ref = formRef.value; // ref抛出去给外面
    })

    const submit = () => {
      const getCodeConfig = (params) => {
        return http.post(Api, params);
      };
      getCodeConfig({ ...inputValue.value }).then(res => {
        console.log(res)
      })
    }

    const renderComponent = () => {
      const vnodeProps = collectProps(props.item.props); // 收集组件属性
      console.log('formProps', vnodeProps)

      const formProps = vnodeProps.formProps;

      // const { api,span,isReadOnly } = formProps.props;
      const { isReadOnly, api, span, gutter, isSubmit, isReset } = formProps.props;

      Api = api; // 获取接口信息

      // const getFormItem = (item, index, isReadOnly) => (
      //   <ElCol key={index} span={Number(span) || 8}>
      //     <ElFormItem label={item.label}>
      //       {isReadOnly ? <div>{item.value}</div> : item.component}
      //     </ElFormItem>
      //   </ElCol>
      // );

      // const formChildren = props.item.children.map((e, index) => {
      //   const item = e.props.item;
      //   debugger
      //   return getFormItem(item, index, isReadOnly);
      // });


      const formChildren = isReadOnly
        ? props.item.children.map((e, index) => {
          const item = e.props.formItemProps;
          return (
            <ElCol key={index} span={Number(span) || 8}>
              <ElFormItem label={item.label}>
                <div>{e.props.formItemProps.value}</div>
              </ElFormItem>
            </ElCol>
          );
        })
        : props.children.map((e, index) => {
          const item = e.props.item;
          return (
            <ElCol key={index} span={Number(span) || 8}>
              <ElFormItem label={item.props.formItemProps.label}>
                {e}
              </ElFormItem>
            </ElCol>
          );
        });

      const form = <ElForm ref={formRef} vModel={inputValue.value} >
        <ElRow gutter={gutter || 20}>{formChildren}</ElRow>
      </ElForm>;

      const button = []
      if (isSubmit) {
        button.push(<ElButton type="primary" onClick={submit}>搜索</ElButton>)
      }
      if (isReset) {
        button.push(<ElButton>重置</ElButton>)
      }
      if (isSubmit || isReset) {
        formChildren.push(
          <div style={{ padding: '0 10px' }}>{button}</div>
        )
      }
      return ([form].filter(Boolean))
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
