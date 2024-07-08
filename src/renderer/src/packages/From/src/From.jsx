import { defineComponent, ref, watch, onMounted } from 'vue';

import { ElRow,ElForm,ElTooltip, ElFormItem, ElCol, ElCollapse,ElCollapseItem, ElSelect, ElOption, ElInput } from 'element-plus';

const From = defineComponent({
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
    const generatePage = (item) => {
      debugger
      item || [].map((e, i) => {
        console.log(e)
        debugger
        typeMapping(e,i)
      })
      return item
    }

    onMounted(() => {
      init()
    });

    return () => (
      <div className={props.pageJSON.className ? `PageContainer,${props.pageJSON.className}` : 'PageContainer'} style={props.pageJSON.style}>
        {
          (generatePage(props.pageJSON.children))
        }
      </div>
    );
  },
});

export default From;
