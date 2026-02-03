import { defineComponent, ref, computed, onMounted } from 'vue';
import { ElTooltip, ElTableColumn, ElTable, ElPagination } from 'element-plus';
import useCodeConfig from '@renderer/views/draggingDragging/hooks/useCodeConfig.ts';
import { deepClone } from '@renderer/utils/index';

const Table = defineComponent({
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
    const { collectProps } = useCodeConfig();

    const tableRef = ref(null);
    const divRes = ref(null);

    const SELECTION_COLUMN = { type: 'selection', label: '', width: 55, align: 'center' };
    const SERIAL_NUMBER_COLUMN = { label: '序号',type:"index", width: 55, align: 'center' };

    onMounted(() => {
      // props.item.ref = tableRef.value
    });

    // 表格数据：优先用 item.data，兼容 item.props.tableDataProps
    const tableData = computed(() => {
      const d = props.item?.data ?? props.item?.props?.tableDataProps?.data;
      return Array.isArray(d) ? d : [];
    });

    // 获取props
    const tableProps = computed(() => {
      const itemProps = props.item?.props || {};
      const propsKey = (props.item?.type || '').toLowerCase() + 'Props';
      const children = itemProps[propsKey]?.children || [];

      return children.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
    });

    const handleSelectionChange = () => {
      console.log('Selection changed');
    };
    const handleCurrentChange = () => {
      console.log('Current page changed');
    }
    const onChange = () => {
      console.log('onChange');
    }
    const prevClick = () => {
      console.log('prevClick');
    }
    const nextClick = () => {
      console.log('nextClick');
    }

    const getColumns = (tableColumnLists, tableProps) => {
      let columns = deepClone(tableColumnLists) || [];
      const tp = tableProps?.props || {};

      if (tp.selectable) {
        columns.unshift(SELECTION_COLUMN);
      } else {
        columns = columns.filter(item => item.type !== 'selection');
      }

      if (tp.serialNumber) {
        const index = columns[0]?.type === 'selection' ? 1 : 0;
        columns.splice(index, 0, SERIAL_NUMBER_COLUMN);
      } else {
        columns = columns.filter(item => item.label !== '序号');
      }

      return columns;
    };

    const renderColumns = (columns) => {
      return columns.map((item) => (
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
        />
      ));
    };

    const renderPaging = (pagingProp, tableProps) => {
      if (!tableProps?.props?.showPagination) return null;
      const data = tableData.value;
      if (!Array.isArray(data)) return null;
      const pp = pagingProp?.props || {};
      return (
        <div style={{ marginTop: '10px', ...(pagingProp?.style || {}) }}>
          <ElPagination
            background={pp.background || false}
            layout="prev, pager, next"
            total={data.length}
            pageSize={pp.pageSize || 5}
            pageSizes={pp.pageSizes || [5, 10, 20]}
            pagerCount={pp.pagerCount || 5}
            currentPage={pp.currentPage || 1}
            size={pp.size || 'small'}
            disabled={pp.disabled || false}
            hideOnSinglePage={pp.hideOnSinglePage || false}
            nextText={pp.nextText}
            prevIcon={pp.prevIcon}
            prevText={pp.prevText}
            appendSizeTo={pp.appendSizeTo}
            popperClass={pp.popperClass}
            onSizeChange={handleSizeChange} // 每页显示个数选择器的选项设置
            onCurrentChange={handleCurrentChange} // 当前页数改变时会触发
            onChange={onChange} //onSizeChange 和 onCurrentChange
            onPrevClick={prevClick} //用户点击上一页按钮改变当前页时触发
            onNextClick={nextClick} //用户点击下一页按钮改变当前页时触发}
          />
        </div>
      );
    };

    const handleSizeChange = (e) => {
      console.log('Page size changed', e);
    }
    const render = () => {
      const itemProps = props.item?.props || {};
      const vnodeProps = collectProps(itemProps);
      const tableProps = vnodeProps.tableProps;
      const tableColumnList = itemProps.tableColumnProps?.itemList || [];
      const pagingProp = vnodeProps.pagingProps;

      const data = Array.isArray(tableData.value) ? tableData.value : [];
      const tp = tableProps?.props || {};

      return (
        <div>
          <ElTable
            ref={tableRef}
            data={data}
            size={tp.size || 'default'}
            border={tp.border}
            stripe={tp.stripe}
            rowStyle={tp.rowStyle}
            headerRowClassName={tp.headerRowClassName}
            headerCellStyle={tp.headerCellStyle}
            cellStyle={tp.cellStyle}
            maxHeight={tp.maxHeight}
            highlightCurrentRow={tp.highlightCurrentRow}
            scrollbarAlwaysOn={tp.scrollbarAlwaysOn}
            sortOrders={tp.sortOrders}
            defaultSort={tp.defaultSort}
            showSummary={tp.showSummary}
            summaryMethod={tp.summaryMethod}
            style={{
              width: '100%',
              minHeight: '300px',
              height: 'calc(100% - 60px)',
              maxHeight: '720px',
            }}
          >
            {renderColumns(getColumns(tableColumnList, tableProps))}
          </ElTable>
          {renderPaging(pagingProp, tableProps)}
        </div>
      );
    };

    const vnode = computed(() => render());

    return () => vnode.value;
  },
});

export default Table;
