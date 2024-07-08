import { defineComponent, ref, watch, onMounted } from 'vue';
import PageContainer from '../../PageContainer/index'

import { ElRow,ElForm,ElTooltip, ElFormItem, ElCol, ElCollapse,ElCollapseItem, ElSelect, ElOption, ElInput } from 'element-plus';

const componentContainer = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {}
    },
    pageJson: Object
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const inputValue = ref(props.modelValue);
    const handleChange = () => {

    }
    const init = () => {

    }

    const typeMapping = (item = {}, index) => {
      let returnElement
      switch (item) {
        case item.type == 'page':
          returnElement = (page(item,index))
          break;
         // 其他类型的处理
         default:
          returnElement = (page(item,index))
          break;
      }
      return returnElement;
    }

    // 页面
    const page = (item, index) => {
      debugger
      return (
        <PageContainer pageJSON={item} key='page'></PageContainer>
      )
    }

    // 动态渲染
    const dynamicRendering = (item) => {
      if (item instanceof Array) {
        return item.map((e, i) => dynamicRendering(e, i));
      }
      return (typeMapping(item))
    }

    onMounted(() => {
      init()
    });

    return () => (
      dynamicRendering(props.pageJson)
    );
  },
});

export default componentContainer;
