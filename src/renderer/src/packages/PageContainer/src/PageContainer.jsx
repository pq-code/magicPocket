import { defineComponent, ref, watch, onMounted } from 'vue';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import './style/index.less'
import From from '@renderer/packages/From/index'
// import PageContainer from '@renderer/packages/PageContainer/index'
import { VueDraggable } from 'vue-draggable-plus'
import { customComponent } from './utils/component'

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

    const handleEnd = (e) => {
      pageJSON.children = componentList
      console.log('pageJSON', pageJSON, currentDragObject, e)
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

    const generateFrom = async(item, index) => {
      if (item.npm) {
        debugger
        customComponent(item)
      }
      return (
        <From key={item.key || index} pageJSON={item}>
          <PageContainer pageJSON={item.children}></PageContainer>
        </From>
      )
    }

    const generateContainer = (item, index) => {
      return (
        <div key={item.key || index} className={item.props.className} style={item.props.style}>
          <PageContainer pageJSON={item.children}></PageContainer>
        </div>
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
