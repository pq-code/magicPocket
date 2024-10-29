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
      const Dom = []
      // 是否只读
      if (props.pageJSON.props?.readOnly) {
        Dom.push(<ElForm vModel={inputValue.value}
          ref="formRef"
          {...props.pageJSON}
        >
          <ElRow>
          {
            props.pageJSON.children.map(e => {
            let pageJSON = e.props.formItemProps
            return (
              <ElCol span={pageJSON.span || 8}>
                <ElFormItem label={pageJSON.label}>
                  <div>
                    {inputValue.value[pageJSON.primaryKey]}
                  </div>
                </ElFormItem>
              </ElCol>
            )
          })
          }
          </ElRow>
        </ElForm>)
      } else {
        Dom.push(
          <ElForm vModel={inputValue.value}
            ref="formRef"
            {...props.pageJSON}
          >
          <ElRow>
          {
            props.children.map(e => {
              let pageJSON = e.props
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
        </ElForm>)
      }

      return ( <DlockContainer item={props.pageJSON} children= {
        Dom.filter(Boolean)
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
