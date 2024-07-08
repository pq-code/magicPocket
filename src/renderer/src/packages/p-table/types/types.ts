import type { Sort } from "element-plus";
// import type { TableColumnCtx } from 'element-plus'
// import type { TableColumnCtx } from 'element-plus'
import type { TableColumnCtx } from "element-plus/es/components/table/src/table-column/defaults";
declare namespace Domains {
  interface tableRow {
    prop: string;
    label: string;
    formatter?: object;
    type?: string;
    width?: string;
    showOverflowTooltip?: boolean;
    minWidth?: string;
    fixed?: boolean | string;
    align?: string;
    slotName?: string;
    required?: boolean;
  }

  interface showOperation {
    showDelLine: boolean;
    showEditLine: boolean;
    showView: boolean;
  }

  interface tableSetUp {
    id?: string;
    maxHeight?: string;
    highlightCurrentRow?: boolean;
    scrollbarAlwaysOn?: boolean;
    sortOrders?: Array<string>;
    defaultSort?: Sort;
    showSelection?: boolean;
    selectFn?: (row: object, index: number) => boolean;
    readonly?: boolean;
    tableColumns?: Array<tableRow>;
    showOperation?: showOperation;
    showSummary?: boolean | Array<string>;
    draggable?: boolean;
    showPagination?: showPagination;
    pageSize?: number;
    pageSizeOptions?: Array<number>;
    virtualList?: boolean;
    limit?: number,
    offset?: number,
    advancedSearch?: boolean; // 高级搜索
    adaptiveHeight?: boolean; // 自适应高度
    tableLayout?: string;
    headerCellStyle?: string;
    cellStyle?: string
  }

  interface showPagination {
    pageSize?: number;
    pageSizeOptions: Array<Number>;
    pagerCount?: number;
    currentPage: Number
  }

  interface Product {
    id: string;
    name: string;
    amount1: string;
    amount2: string;
    amount3: number;
  }

  interface SummaryMethodProps<T = Product> {
    columns: TableColumnCtx<T>[]
    data: T[]
  }
}

export type { Domains };
