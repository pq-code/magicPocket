import { ElButton } from 'element-plus';
import { defineComponent, ref, watch, onMounted } from 'vue';
import canvasOperation from '../hooks/canvasOperation';
const draggingDraggingHead = defineComponent({
  props: {
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const {
      upHistoryOperatingObject,
      clearHistoryOperatingObject,
      backHistoryOperatingObject
    } = canvasOperation()
    onMounted(() => {
    });

    const vnode = () => {
      return (
        <div class="dragging-dragging-head-center">
          <div>
            <ElButton text='primary'>
              <i className='iconfont icon-caidan2'></i>
            </ElButton>
          </div>
          <div className='dragging-dragging-head-center-button'>
          <ElTooltip effect="dark" placement="top-start" content="撤销">
            <ElButton text='primary'>
              <i className='iconfont icon-houtui' onClick={upHistoryOperatingObject}></i>
            </ElButton>
          </ElTooltip>
          <ElTooltip effect="dark" placement="top-start" content="恢复">
            <ElButton text='primary'>
            <i className='iconfont icon-jiantouqianjin' onClick={backHistoryOperatingObject}></i>
            </ElButton>
          </ElTooltip>
          <ElButton onClick={clearHistoryOperatingObject}>重做</ElButton>
          </div>
        </div>
      )
    }

    return () => (
      vnode()
    );
  },
});

export default draggingDraggingHead;
