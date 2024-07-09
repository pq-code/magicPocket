import { defineComponent, ref, watch, onMounted } from 'vue';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import '../style/index.less'
import From from '../../From/index'

import { ElRow,ElForm,ElTooltip, ElFormItem, ElCol, ElCollapse,ElCollapseItem, ElSelect, ElOption, ElInput } from 'element-plus';

const PageContainer = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {}
    },
    pageJSON: {
      type: Object,
      default: () => {}
    },
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const inputValue = ref(props.modelValue);
    const { pageJSON } = useDraggingDraggingStore()

    const dynamicRendering = (item) => {
      if (item instanceof Array) {
        return item.map((e, i) => dynamicRendering(e, i));
      }
      return typeMapping(item)
    }

    const typeMapping = (item = {}, index) => {
      console.log(item)
      debugger
      let returnElement
      switch (item) {
        case item.type == 'from':
          returnElement = (generateFrom(item.children,index))
          break;
         // 其他类型的处理
         default:
          returnElement = (generateFrom(item,index))
          break;
      }
      return returnElement;
    }

    const generateFrom = (item) => {
      return (
        <From pageJSON={item}></From>
      )
    }
    onMounted(() => {
    });

    return () => (
      // <div className={'PageContainer' || pageJSON.props.className} style={pageJSON.props.style}>
       
      // </div>
      <VueDraggable ref="componentContainer"
        className={ pageJSON.props.className || 'PageContainer'}
        style={pageJSON.props.style}
        vModel={pageJSON.props.children}
        animation="150"
        group='people'
        tag="ul"
        sort={true}
      >
        {dynamicRendering(pageJSON.props.children)}
      </VueDraggable>
    );
  },
});

export default PageContainer;
