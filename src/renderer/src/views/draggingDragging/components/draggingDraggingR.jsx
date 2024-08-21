import { defineComponent, ref, watch, onMounted } from 'vue';
import DlockContainerOperatorPanel from '@renderer/packages/DlockContainer/src/DlockContainerOperatorPanel.jsx'

import { ElInput, ElSwitch } from 'element-plus';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import { storeToRefs } from 'pinia'

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
    const store = useDraggingDraggingStore();
    const { pageJSON,currentOperatingObject } = storeToRefs(store);

    // 当前操作对象
    // const currentObject = currentOperatingObject
    // computed(() => {
    //   return currentOperatingObject.value
    // });
    watch(() => pageJSON.value, (n, o) => {
      console.log(n)
      debugger
    },{deep:true})

    const init = () => {

    }
    onMounted(() => {
      init()
    });

    const RenderEngine = (item) => {
      if (!item || JSON.stringify(item) == '{}') return (
        <div style={
          {'text-align': 'center',
            'line-height': '500px',
            'font-size': '13px',
            'font-weight': 600,
            color: 'rgb(51, 51, 51)',
            padding: '0px 5px',
            background: '-webkit-linear-gradient(315deg, rgb(66, 211, 146) 25%, rgb(100, 126, 255)) text',
            '-webkit-text-fill-color': 'transparent'}
        }> 点击中间画布区域选中要操作的对象 </div>
      )
      switch (item.type) {
        case 'container':
          return (
            <DlockContainerOperatorPanel item={item}></DlockContainerOperatorPanel>
          )
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
      RenderEngine(currentOperatingObject.value)
    );
  },
});

export default draggingDraggingL;
