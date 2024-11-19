import { defineComponent, ref, watch, nextTick, computed, onMounted } from 'vue';
import DlockContainer from '@renderer/packages/DlockContainer/src/DlockContainer.jsx'
import { ElTooltip } from 'element-plus';
const Table = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => { }
    },
    item: {
      type: Object,
      default: () => { }
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
    const tableRef = ref(null);
    const divRes = ref(null)

    onMounted(() => {
      console.log(divRes.value)
    });
    const tableData = ref(props.item.data);

    // 获取props
    const tableProps = computed(() => {
      const itemProps = props.item?.props || {};
      const propsKey = (props.item?.type || '').toLowerCase() + 'Props';
      const children = itemProps[propsKey]?.children || [];

      return children.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
    })
    const handleSelectionChange = () => {
      console.log('123213213123123')
    }
    // 计算是否需要勾选
    const columns = computed(() => {
      let children = props.item?.children || [];
      if (tableProps.value.selectable && children[0]?.type !== 'selection') {
        children = [{ width: 55, type: 'selection' }, ...children];
      } else if (!tableProps.value.selectable && children[0]?.type === 'selection') {
        children = children.slice(1);
      }
      console.log(children)
      return children;
    });

    // 获取ElTableColumnList
    const ElTableColumnList = () => {
      return columns.value.map((item) => {
        return (
          <ElTableColumn
            prop={item?.prop}
            label={item?.label}
            width={item?.width}
            align={item?.align}
            fixed={item?.fixed}
            minWidth={item?.minWidth}
            showOverflowTooltip={item?.showOverflowTooltip}
            type={item?.type}
            onselectionChange={handleSelectionChange}
          >
            {{
              header: () => {
                if (item.description) {
                  return (
                    <div title={item.description}>
                      <ElTooltip effect="dark" placement="top-start">
                        {{
                          default: () => item.label,
                          content: () => item.description,
                        }}
                      </ElTooltip>
                    </div>
                  );
                }
                return item.label;
              },
              default: () => {
                if (item.slotName != null && item.slotName !== '') {
                  return <div>{item.slotName}</div>;
                }
                return null;
              }
            }}
          </ElTableColumn>
        )
      }).filter(Boolean);
    }

    return () => (
      <DlockContainer ref={divRes} item={props.item} children={
        <div>
          <ElTable
            ref={tableRef}
            data={tableData.value}
            // height={tableProps.value?.height}
            border={tableProps.value?.border}
            stripe={tableProps.value?.stripe}
            rowStyle={tableProps.value?.rowStyle}
            headerRowClassName={tableProps.value?.headerRowClassName}
            headerCellStyle={tableProps.value?.headerCellStyle}
            cellStyle={tableProps.value?.cellStyle}
            maxHeight={tableProps.value?.maxHeight}
            highlightCurrentRow={tableProps.value?.highlightCurrentRow}
            scrollbarAlwaysOn={tableProps.value?.scrollbarAlwaysOn}
            sortOrders={tableProps.value?.sortOrders}
            defaultSort={tableProps.value?.defaultSort}
            showSummary={tableProps.value?.showSummary}
            summaryMethod={tableProps.value?.summaryMethod}
            style={tableProps.value?.style || {
              width: '100%',
              'min-height': '300px',
              'height': 'calc(100% - 60px)',
              'max-height': '720px'
            }
            }>
            {ElTableColumnList()}
          </ElTable>
          {tableProps.value?.showPagination ?
          <div style={{'margin-top' : '10px'}}>
            <ElPagination background layout="prev, pager, next" total={tableData.value.length} />
          </div> : null}
        </div>
        }/>
    )
  },
});

export default Table;
