import { defineComponent, ref, watch, onMounted } from 'vue';

import { ElRow,ElForm,ElTooltip, ElFormItem, ElCol, ElDatePicker, ElRadioGroup, ElRadio, ElSelect, ElOption, ElInput } from 'element-plus';

const componentContainer = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {}
    },
    listData: {
      type: Array,
      default: () => []
    }
    // fileListMap: Object
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const inputValue = ref(props.modelValue);
    const componentContainerSon = ref([
      { name: '表单' },
      { name: '输入框' },
      { name: '下拉框' },
      { name: '时间' },
    ])
    const init = () => {

    }

    const selectComponents = (e) => {
      console.log(e)
    }

    onMounted(() => {
      init()
    });

    return () => (
      <div className='componentContainer'>
        {componentContainerSon.value.map((item, index) => {
           return  <div className='componentContainerSon' onClick={selectComponents}> {item.name} </div>
         })}
      </div>
    );
  },
});

export default componentContainer;
