import { defineComponent, ref, watch, onMounted } from 'vue';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import '../style/index.less'
import From from '../../From/index'
import { VueDraggable } from 'vue-draggable-plus'

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
    const { pageJSON,currentDragObject} = useDraggingDraggingStore()
    // const componentList = computed(() => pageJSON.children);
    const componentList = ref([])
    // const onAdd = () => {
    //   pageJSON.children.push(currentDragObject)
    //   console.log('pageJSON', pageJSON, currentDragObject)
    //   debugger
    // }
    const handleEnd = (e) => {
      console.log(e)
      debugger
    }

    const dynamicRendering = (item) => {
      if (item instanceof Array) {
        return item.map((e, i) => dynamicRendering(e, i));
      }
      return typeMapping(item)
    }

    const typeMapping = (item = {}, index) => {
      let returnElement
      switch (item.type) {
        case 'from':
          returnElement = (generateFrom(item,index))
          break;
         // 其他类型的处理
         default:
          returnElement = generateContainer(item,index)
          break;
      }
      return returnElement;
    }

    const generateFrom = (item,index) => {
      return (
        <From key={item.key || index} pageJSON={item}>{item}</From>
      )
    }

    const generateContainer = (item, index) => {
      return (
        <div key={item.key || index} className={item.props.className} style={item.props.style}/>
      )
    }
    onMounted(() => {
    });

    return () => (
      <VueDraggable
        className='PageContainer'
        vModel={componentList.value}
        animation={150}
        group='people'
        sort='ture'
        onEnd={handleEnd}
      >
       {componentList.value.map((e,i) => {
          return dynamicRendering(e,i)
        })}
      </VueDraggable>
    );
  },
});

export default PageContainer;
