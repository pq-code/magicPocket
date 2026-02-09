import { defineComponent, ref } from 'vue';
import { ElDrawer, ElButton } from 'element-plus';
import "../style/index.less";

const CreateCode = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => { }
    },
    pageJSON: {
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
  setup(props, { emit }) {
    const handleClose = () => {
      emit('update:modelValue', false);
    }
    const clickCopy = () => {
      navigator.clipboard.writeText(code.value)
        .then(() => {
          ElMessage({ message: '复制成功', type: 'success' })
        })
        .catch((error) => {
          console.error('复制失败：', error);
        });
    }
    const code = ref(
      `
       <ElForm vModel={props.modelValue}
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
      </ElForm>
      `)
    return () => (
      <ElDrawer
        vModel={props.modelValue}
        title="代码生成"
        direction='rtl'
        size='50%'
        before-close={handleClose}
      >
        <div className='ElDrawer-heard'>
          <ElButton type='primary' text='primary' onClick={clickCopy}>
            点击复制
          </ElButton>
        </div>
        <div className='ElDrawer-center'>
          <highlightjs
            language='javascript'
            code={code.value}>
          </highlightjs>
        </div>
      </ElDrawer>
    );
  },
});

export default CreateCode;

