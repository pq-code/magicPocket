import { ElButton, ElPageHeader, ElAvatar, ElDrawer, ElTooltip } from 'element-plus';
import { defineComponent, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import useCanvasOperation from '../hooks/useCanvasOperation';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore';
import CreateCode from '@renderer/internal/CreateCode/src/CreateCode.jsx';
import router from '@renderer/router/index';

/** 使用 localStorage 以便新窗口能读到（sessionStorage 按窗口隔离，新窗口读不到） */
const PREVIEW_STORAGE_KEY = 'lowcode_preview_page';

const draggingDraggingHead = defineComponent({
  props: {},
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const drawer = ref(false);
    const store = useDraggingDraggingStore();
    const { pageJSON, currentOperatingObject } = storeToRefs(store);
    const {
      upHistoryOperatingObject,
      clearHistoryOperatingObject,
      backHistoryOperatingObject,
      deleteSelectedNode,
    } = useCanvasOperation();

    const onBack = () => {
      router.push({ name: 'lowCodeHome' });
    };

    /** 预览：同窗口内路由跳转，保证与编辑页共用 localStorage，数据一定可读 */
    const openPreview = () => {
      const page = JSON.parse(JSON.stringify(pageJSON.value));
      page.whetherYouCanDrag = false;
      localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(page));
      router.push({ name: 'lowCodePreview' });
    };

    const foundCode = () => {
      drawer.value = true;
    };

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
                    padding: '0 5px',
                    color: 'rgb(51, 51, 51)',
                    padding: '0px 5px',
                    background: '-webkit-linear-gradient(315deg, #42d392 25%, #647eff)',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
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
          <ElTooltip effect="dark" placement="top-start" content="删除 (Delete/Backspace)">
            <ElButton
              text="primary"
              disabled={!currentOperatingObject.value || currentOperatingObject.value?.type === 'page'}
              onClick={deleteSelectedNode}
            >
              <i className='iconfont icon-lajitong5'></i>
            </ElButton>
          </ElTooltip>
            <ElButton onClick={clearHistoryOperatingObject}>清空</ElButton>
            <ElButton onClick={openPreview} type="primary">预览</ElButton>
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
