import { defineComponent, ref, watch, onMounted } from 'vue';
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
    const handleChange = () => {

    }
    const init = () => {

    }
    // 生成页面
    // const generatePage = (item) => {
    //   debugger
    //   item || [].map((e, i) => {
    //     console.log(e)
    //     debugger
    //     typeMapping(e,i)
    //   })
    //   return item
    // }

    const typeMapping = (item = {}, index) => {
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
      init()
    });

    return () => (
      <div className={'PageContainer' || props.pageJSON?.className } style={ props.pageJSON?.style }>
         {typeMapping(props.pageJSON)}
      </div>
    );
  },
});

export default PageContainer;
