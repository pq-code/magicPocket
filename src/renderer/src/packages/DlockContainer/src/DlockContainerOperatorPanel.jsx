import { defineComponent, ref, watch, onMounted } from 'vue';
import './style/index.less'

import { ElMenu, ElMenuItem, ElCollapse, ElCollapseItem, ElInput, ElSwitch, ElButton, ElSegmented } from 'element-plus';

const DlockContainerOperatorPanel = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {}
    },
    item: {
      type: Object,
      default: () => { }
    }
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    // 当前操作对象
    // const currentObject = computed(() => {
    //   debugger
    //   return props.item
    // });

    watch(()=>props.item, (newValue, oldValue) => {
      console.log(newValue, oldValue)
    })

    const activeIndex = ref('1')
    const activeNames = ref('1')

    const handleChange = () => {

    }
    const handleSelect = () => {

    }

    const RenderEngine = () => {
    }
    const init = () => {

    }
    onMounted(() => {
      init()
    });

    return () => (
      <div className='draggingDraggingR'>
        <ElMenu
          default-active={activeIndex.value}
          mode="horizontal"
          onSelect={handleSelect}
        >
          <ElMenuItem index='1' style={{width: '33.3%'}}>
            组件
          </ElMenuItem>
          <ElMenuItem index='2' style={{width: '33.3%'}}>
            样式
          </ElMenuItem>
          <ElMenuItem index='3' style={{width: '33.3%'}}>
            高级
          </ElMenuItem>
        </ElMenu>
        <div className='draggingDraggingR-content'>
          <div className='draggingDraggingR-content-list'>
            {
              activeIndex.value == '1' ?
            (<ElCollapse vModel={activeNames.value} onChange={handleChange}>
              <ElCollapseItem title='布局'>
                <div className='layout'>
                  <div style={{ display: 'flex', alignItems: 'center' ,'justify-content': 'space-between'}}>
                    <span style={{'min-width': '100px'}}>水平</span>
                    <ElSegmented vModel={props.item.props.levelLayout} size="small" options={['左', '中', '右', '两端']}/>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' ,'justify-content': 'space-between','margin-top': '10px'}}>
                    <span style={{'min-width': '100px'}}>垂直</span>
                    <ElSegmented vModel={props.item.props.verticalLayout} size="small" options={['左', '中', '右', '两端']}/>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' ,'justify-content': 'space-between','margin-top': '10px'}}>
                    <span style={{'min-width': '100px'}}>间距</span>
                    <ElInput vModel={props.item.props.spacing} size="small"/>
                  </div>
                </div>
              </ElCollapseItem>

              <ElCollapseItem title='宽高'>
                <div className='layout'>
                  <div style={{ display: 'flex', alignItems: 'center' ,'justify-content': 'space-between'}}>
                    <span style={{'min-width': '100px'}}>宽度</span>
                    <ElInput width="100%" vModel={props.item.props.spacing} size="small"/>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' ,'justify-content': 'space-between','margin-top': '10px'}}>
                    <span style={{'min-width': '100px'}}>高度</span>
                    <div style={{ display: 'flex' }}>
                      <ElInput style={{'min-width': '100px'}} vModel={props.item.props.spacing} size="small"/>
                      <ElSegmented style={{'margin-left': '10px'}} vModel={props.item.props.verticalLayout} size="small" options={['自适应']}/>
                    </div>
                  </div>
                </div>
              </ElCollapseItem>
                </ElCollapse>) :
                (
                  <div></div>
                )
            }
          </div>
        </div>
      </div>
    );
  },
});

export default DlockContainerOperatorPanel;
