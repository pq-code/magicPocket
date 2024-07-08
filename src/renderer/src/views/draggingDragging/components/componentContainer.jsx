import { defineComponent, ref, watch, onMounted } from 'vue';
import { VueDraggable } from 'vue-draggable-plus'
import { ElRow,ElForm,ElTooltip, ElFormItem, ElCol, ElDatePicker, ElRadioGroup, ElRadio, ElSelect, ElOption, ElInput } from 'element-plus';
import { componentList } from "@renderer/components/materialArea/materialArea"

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
    const isDisabled = false
    const list1 = ref([])
    const componentContainerSon = ref(
      componentList
    )
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
        <VueDraggable ref="componentContainer"
          vmodel={componentContainerSon.value}
          group={ {name: 'people', pull: 'clone', put: false} }
          itemKey="componentName" animation="150">
          {componentContainerSon.value.map((item, index) => {
            return <div
                    key={`${item.componentName}_${index}`}
                    className='componentContainerSon'
                    onClick={selectComponents}>
                      {item.componentName}
                  </div>
          })}
        </VueDraggable>
      </div>
    );
  },
});

export default componentContainer;
