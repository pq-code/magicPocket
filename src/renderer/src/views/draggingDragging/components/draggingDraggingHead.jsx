import { ElButton,ElPageHeader,ElBreadcrumbItem,ElAvatar,ElTag ,ElDrawer} from 'element-plus';
import { defineComponent, ref, watch, onMounted } from 'vue';
import canvasOperation from '../hooks/canvasOperation';
import CreateCode from '@renderer/packages/CreateCode';

const draggingDraggingHead = defineComponent({
  props: {
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const drawer = ref()
    const {
      upHistoryOperatingObject,
      clearHistoryOperatingObject,
      backHistoryOperatingObject
    } = canvasOperation()

    const onBack = () => {

    }

    const foundCode = () =>{
      console.log('代码生成')
      drawer.value = true
    }

    onMounted(() => {
    });

    const vnode = () => {
      return (
        <div class="dragging-dragging-head-center">
          <div className='dragging-dragging-head-center-l'>
            <ElPageHeader onBack={onBack}>
              <div class="flex items-center">
                <ElAvatar
                  class="mr-3"
                  size={32}
                  src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                />
                <span class="text-large font-600 mr-3" style={
                  {
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#333',
                    padding: '0 5px'
                  }
                }> 低代码平台 </span>
                <div class="flex items-center">
                <ElButton text='primary'>
                  <i className='iconfont icon-caidan2'></i>
                </ElButton>
                </div>
              </div>
            </ElPageHeader>
          </div>
          <div className='dragging-dragging-head-center-button'>
          <ElTooltip effect="dark" placement="top-start" content="撤销">
            <ElButton text='primary'>
              <i className='iconfont icon-houtui' onClick={backHistoryOperatingObject}></i>
            </ElButton>
          </ElTooltip>
          <ElTooltip effect="dark" placement="top-start" content="恢复">
            <ElButton text='primary'>
            <i className='iconfont icon-jiantouqianjin' onClick={upHistoryOperatingObject}></i>
            </ElButton>
          </ElTooltip>
            <ElButton onClick={clearHistoryOperatingObject}>重做</ElButton>
            <ElButton onClick={foundCode} type="primary">代码生成</ElButton>
          </div>

          <CreateCode vModel={drawer.value}></CreateCode>
        </div>
      )
    }
    return () => (
      vnode()
    );
  },
});

export default draggingDraggingHead;
