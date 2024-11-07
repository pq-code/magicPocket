import { defineComponent, ref, watch, onMounted } from 'vue';
import DlockContainerOperatorPanel from '@renderer/packages/DlockContainer/src/DlockContainerOperatorPanel.jsx'
import FormvOperatorPanel from '@renderer/packages/Form/src/FormOperatorPanel.jsx'
import { ElInput, ElSwitch } from 'element-plus';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import { storeToRefs } from 'pinia'
import ControlPanel from '@renderer/packages/ControlPanel/src/ControlPanel'

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
    const { pageJSON, currentOperatingObject } = storeToRefs(store);
    const draggingDraggingRRef = ref(null)
    const activeIndex = ref(0);
    const activeNames = ref('')
    const handleSelect = (index) => {
      activeIndex.value = index;
    };
    const handleChange = () => {
      
    }
    const init = () => {

    }
    onMounted(() => {
      init()
    });

    // const TypeRender = (item) => {
    //   switch (item.type) {
    //     case 'container':
    //       return (
    //         <DlockContainerOperatorPanel item={item}></DlockContainerOperatorPanel>
    //       )
    //     case 'Form':
    //       return (
    //        <FormvOperatorPanel item={item}></FormvOperatorPanel>
    //       )
    //     case 'switch':
    //       return (
    //         <div className='RadioLabel'>
    //           <div className='RadioLabel-titel'> {item.label}</div>
    //           <ElSwitch
    //             modelValue={item.value}
    //             size="small"
    //             active-text="编辑"
    //             inactive-text="只读"
    //           />
    //         </div>
    //       )
    //     default:
    //       return (
    //         <div className='form-item'>
    //           <div>{item.label}</div>
    //           <ElInput size="small" {...item} > </ElInput>
    //         </div>
    //       )
    //   }
    // }

    const TypeRender = (item) => {
      return (
        <ControlPanel item={item}></ControlPanel>
      )
    }

    const RenderEngine = (item) => {
      if (!item || JSON.stringify(item) == '{}') (
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

      return (
        <div className="draggingDraggingR">
          <div className="draggingDraggingR-content">
            <div
              ref={draggingDraggingRRef}
              className="draggingDraggingR-content-list"
            >
              <ElCollapse vModel={activeNames.value} onChange={handleChange}>
                { TypeRender(item) }
              </ElCollapse>
            </div>
          </div>
        </div>
      )
    }

    return () => (
      RenderEngine(currentOperatingObject.value)
    );
  },
});

export default draggingDraggingL;
