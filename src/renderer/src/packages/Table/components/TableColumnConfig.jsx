import { defineComponent, ref, defineExpose } from 'vue';
import { ElDrawer, ElFormItem, ElForm, ElInput, ElButton } from 'element-plus';
import style from '../style/index.module.less';
import TableColumnSide from './TableColumnSide';

const TableColumnConfig = defineComponent({
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
    const TableColumnSideRef = ref(null);

    const getItemList = () => {
      const list = props.item?.props?.tableColumnProps?.itemList;
      if (Array.isArray(list)) return list;
      // 兜底：如果不存在则初始化为响应式数组
      if (props.item?.props?.tableColumnProps) {
        props.item.props.tableColumnProps.itemList = [];
        return props.item.props.tableColumnProps.itemList;
      }
      return [];
    };

    const addFormItem = () => {
      const list = getItemList();
      list.push({
        label: '表格' + (list.length + 1),
        prop: '',
        width: 200,
        align: 'center',
      });
    }

    const deleatFormItem = (i) => {
      const list = getItemList();
      list.splice(i, 1);
    }

    const editFormItem = (i) => {
      console.log('TableColumnSideRef.value', TableColumnSideRef.value)
      const list = getItemList();
      TableColumnSideRef.value?.openDrawer(list[i])
    }

    const tableColumn = (children) => {
      return children.map((item, i) => {
        return (
          <div className={style.FormItemConfig}>
            <i className='iconfont icon-bianji' style={{'cursor':'pointer'}} onClick={() => {editFormItem(i)}}></i>
            <ElInput size="small" vModel={item.label}/>
            <ElInput size="small" vModel={item.prop}/>
            <i className='iconfont icon-lajitong5' style={{'cursor':'pointer'}}  onClick={() => {
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
          <span>key</span>
        </div>
        <div className={style.FormItemConfigList}>
          {tableColumn(props.item?.props?.tableColumnProps?.itemList || [])}
        </div>
        <div style={"margin-top: 10px"}> <ElButton onClick={addFormItem} text>添加</ElButton> </div>
        <TableColumnSide ref={TableColumnSideRef}></TableColumnSide>
      </div>
    );
  },
});

export default TableColumnConfig;
