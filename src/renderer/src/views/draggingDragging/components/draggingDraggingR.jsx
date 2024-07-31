import { defineComponent, ref, watch, onMounted } from 'vue';

import { ElMenu, ElMenuItem, ElCollapse, ElCollapseItem, ElInput, ElSwitch, ElButton } from 'element-plus';

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
    const activeIndex = ref('1')
    const activeNames = ref('1')
    const init = () => {

    }
    onMounted(() => {
      init()
    });

    const handleSelect = () => {

    }
    const handleChange = () => {
    }
    const componentItemList = ref([{
      label: '整体配置',
      children: [
        {
          label: '按钮的位置',
          type:'input'
        },{
          label: '只读状态',
          type: 'switch',
          value: 0
        },
        {
          label: '表单项',
          type:'input'
        }
      ]
    },{
      label: '表单项',
      children: [
        {
          label: '表单项',
          type:'formItem'
        },{
          label: '表单项',
          type:'formItem'
        },
        {
          label: '表单项',
          type:'formItem'
        }
      ]
    }])
    const componentList = ref([])

    const RenderEngine = (item) => {
      switch(item.type) {
        case 'formItem':
          return (
            <div className='form-item'>
              <div className='form-item-label'>
                <div>label</div>
                <ElInput size="small" {...item} modelValue={item.label}> </ElInput>
              </div>
              <div className='form-item-modeVlaue'>
                <div>value</div>
                <ElInput size="small" {...item} > </ElInput>
              </div>
            </div>
          )
        case 'switch':
          return (
            <div className='RadioLabel'>
              <div className='RadioLabel-titel'> {item.label}</div>
              <ElSwitch
                modelValue={item.value}
                size="small"
                active-text="编辑"
                inactive-text="只读"
              />
            </div>
          )
        default:
          return (
            <div className='form-item'>
              <div>{item.label}</div>
              <ElInput size="small" {...item} > </ElInput>
            </div>
          )
      }
    }
    return () => (
      <div className='draggingDraggingR'>
        <ElMenu
          default-active={activeIndex}
          mode="horizontal"
          onSelect={handleSelect}
        >
          <ElMenuItem index='1'>
            组件
          </ElMenuItem>
          <ElMenuItem index='2'>
            样式
          </ElMenuItem>
          <ElMenuItem index='3'>
            高级
          </ElMenuItem>
        </ElMenu>
        <div className='draggingDraggingR-content'>
          <div className='draggingDraggingR-content-list'>
            <ElCollapse vModel={activeNames} onChange={handleChange}>
              {
                (componentItemList.value.map((item, index) => {
                  return <ElCollapseItem title={item.label} name={index}>
                         { item.children?.map(e => RenderEngine(e)) }
                        </ElCollapseItem>
                }))
              }
            </ElCollapse>
          </div>
        </div>
      </div>
    );
  },
});

export default draggingDraggingL;
