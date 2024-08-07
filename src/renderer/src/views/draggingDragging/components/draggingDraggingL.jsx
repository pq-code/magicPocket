import { defineComponent, ref, watch, onMounted } from 'vue';
import componentContainer from './componentContainer'
import { Search } from '@element-plus/icons-vue'
import { componentList } from "@renderer/components/materialArea/materialArea"
import { buildUUID } from "@renderer/utils"
import { ElRow,ElForm,ElTooltip, ElFormItem, ElCol, ElCollapse,ElCollapseItem, ElSelect, ElOption, ElInput } from 'element-plus';

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
    let activeNames = ref([])
    const inputValue = ref(props.modelValue);
    const componentItemList = ref([])
    const handleChange = () => {

    }
    const init = () => {
      let map = new Map()
      componentList.forEach(element => {
        if (!map.has(element.group)) {
          element.key = buildUUID()
          map.set(element.group,[element])
        } else {
          let rustl = map.get(element.group)
          element.key = buildUUID()
          map.set(element.group,[...rustl,element])
        }
      });
      componentItemList.value = Object.fromEntries(map);
    }
    onMounted(() => {
      init()
    });

    return () => (
      <div className='draggingDraggingL'>
        <div className='draggingDraggingL-title'> 组件库 </div>
        <div className='draggingDraggingL-main'>
          <ElInput placeholder="搜索组件库" suffix-icon={Search} > </ElInput>
          <div className='draggingDraggingL-container'>
            <ElCollapse vModel={activeNames} onChange={handleChange}>
              {
                (Object.keys(componentItemList.value).map((key, index) => {
                 return <ElCollapseItem title={key} name={index}>
                          <componentContainer componentList={componentItemList.value[key]}></componentContainer>
                        </ElCollapseItem>
                }))
              }
          </ElCollapse>
          </div>
        </div>
      </div>
    );
  },
});

export default draggingDraggingL;
