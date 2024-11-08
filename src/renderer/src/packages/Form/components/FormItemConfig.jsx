import { defineComponent, ref, defineExpose } from 'vue';
import { ElDrawer, ElFormItem, ElForm, ElInput, ElButton } from 'element-plus';
import style from '../style/index.module.less';
import FormItemEdit from '../components/FormItemEdit';
const From = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    item: {
      type: Object,
      default: () => ({})
    },
    children: {
      type: Array,
      default: () => []
    },
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const FormItemEditRef = ref(null);
    console.log(props.item)

    const addFormItem = () => {
      props.item?.children.push({
          "componentName": "输入框",
          "type": "input",
          "icon": "",
          "group": "基础组件",
          "npm": {
              "exportName": "ElInput",
              "package": "element-plus",
              "destructuring": true
          },
          "props": {
              "formItemProps": {
                  "primaryKey": "760",
                  "label": "表单项",
                  "size": "medium",
                  "device": "desktop",
                  "fullWidth": true
              },
              "placeholder": "请输入"
          },
          "key": "input-603"
      })
    }
    const deleatFormItem = (i) => {
      props.item?.children.splice(i,1)
    }

    const editFormItem = (i) => {
      FormItemEditRef.value?.openDrawer(props.item?.children[i])
    }

    const formItem = (children) => {
      return children.map((item,i) => {
        return (
          <div className={style.FormItemConfig}>
            <i className='iconfont icon-bianji cursor:pointer;' onClick={() => {editFormItem(i)}}></i>
            <ElInput size="small" vModel={item.props.formItemProps.label}/>
            <ElInput size="small" vModel={item.props.formItemProps.value}/>
            <i className='iconfont icon-lajitong5 cursor:pointer;' onClick={() => {
              deleatFormItem(i)
            }}></i>
          </div>
        );
      })
    }
    return () => (
      <div>
        <div className={style.FormItemConfigTitle}>
          <span>标题</span>
          <span>value</span>
        </div>
        <div className={style.FormItemConfigList}>
          {formItem(props.item?.children)}
        </div>
        <div style={"margin-top: 10px"}> <ElButton onClick={addFormItem} text>添加</ElButton> </div>
        <FormItemEdit ref={FormItemEditRef}></FormItemEdit>
      </div>
    );
  },
});

export default From;
