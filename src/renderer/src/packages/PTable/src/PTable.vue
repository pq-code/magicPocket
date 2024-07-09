<script setup lang="ts">
import { computed, onMounted, onUpdated, ref, watch, nextTick } from "vue";
// import { ColumnStyle, ElTable, SummaryMethod } from "element-plus";
// import Sortable from "sortablejs";
import PPagination from "./components/p-pagination.vue";
import { dataGrouping } from "../table";
import type { Domains } from "../types/types";
import dayjs from "dayjs";

const emits = defineEmits([
  "handleDelete",
  "handleEdit",
  "handleView",
  "handleCurrent-change",
  "handleSelection-change",
  "rowDblclick",
  "rowStyle",
  "paginationQuery",
  "getDetails",
  "currentChange",
]);

const props = defineProps({
  tableSetUp: {
    type: Object,
    default() {
      return {};
    },
  },
  tableData: {
    type: Array,
    default() {
      return [];
    },
  },
  loading: {
    type: Boolean,
    default() {
      return false;
    },
  },
  haveBorder: { //是否显示边框
    type: Boolean,
    default() {
      return false;
    },
  },
  isShowPagination: { //是否显示分页
    type: Boolean,
    default() {
      return true;
    },
  }
});

const tableRef = ref<InstanceType<typeof ElTable>>();

const tableSetUp: Domains.tableSetUp = {};

const pData = ref({
  currentRow: {}, // 当前行数据
  tableData: [],
  pageTableData: [],
  tableSetUp: tableSetUp,
  selectedData: [], // 当前选中的数据
});

watch(
  () => props.tableData,
  (n, o) => {
    if (n) {
      if (pData.value.tableSetUp.showPagination) {
        pData.value.tableData = dataGrouping(n, pageSize.value, 1);
      } else {
        pData.value.tableData = n;
        // pData.value.tableData = dataGrouping(n, 10, 1);
      }
    }
  }
);

const randomId = ref(`pTable${Number(Math.random() * 10000).toFixed(0)}`);

const tableClass = computed(() => {
  return props.tableSetUp.class ? "" : "tabel-default";
});

const tabelHeight = computed(() => {
  return props.tableSetUp.tabelHeight ? props.tableSetUp.tabelHeight : "400";
});

const showSummary = computed(() => {
  if (pData.value.tableSetUp.showSummary) return true;
  if (Array.isArray(pData.value.tableSetUp.showSummary)) return true;
});

// 默认过长显示
const showOverflowTooltip = computed(() => {
  return (e: boolean | any) => {
    if (e !== undefined && typeof e == "boolean") return e;
    return true;
  };
});

// 删除
const handleDelete = (index: String, row: object) => {
  emits("handleDelete", index, row);
};

// 编辑
const handleEdit = (index: String, row: object) => {
  console.log(index, row);
  emits("handleEdit", index, row);
};

// 查看
const handleView = (index: String, row: object) => {
  emits("handleView", index, row);
};

// 当前所选中的行的数据
const handleCurrentChange = (val: object) => {
  emits("handleCurrent-change", val);
};

// 当前所勾选的数据
const handleSelectionChange = (val: any) => {
  if (val.length == 0) {
    pData.value.selectedData = [];
  } else {
    pData.value.selectedData = pData.value.selectedData.concat(val);
  }
  console.log(pData.value.selectedData);
  emits("handleSelection-change", val);
};

const setCurrentRow = (e: object) => {
  tableRef.value!.setCurrentRow(e);
};

// 解决选中
const getDetails = (e: object, column: Object) => {
  console.log(column);
  if (!column) {
    pData.value.currentRow = e;
    if (
      pData.value.tableSetUp.showSelection &&
      !pData.value.tableSetUp.selectFn
    ) {
      tableRef.value!.toggleRowSelection(e, column);
    }
  }
  emits("getDetails", e, column);
};

// 是否可以选中设置
const selectFn = (row: object, index: number) => {
  if (props.tableSetUp.selectFn) {
    if (props.tableSetUp.selectFn.call(null, row, index)) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};

// 点击
const rowDblClick = (row: object, column: object, event: object) => {
  console.log(row, column, event);

  emits("rowDblclick", row, column, event);
};

// 排序
const changeTableSort = (e: object) => {
  console.log(e);
};

watch(
  () => props.tableSetUp,
  (n, o) => {
    pData.value.tableSetUp = JSON.parse(JSON.stringify(n));
  },
  { deep: true, immediate: true }
);

// 列拖拽
const columnDrop = () => {
  // const wrapperTr = document.querySelector(
  //   `#${randomId.value} .el-table__header-wrapper tr`
  // ) as HTMLElement;

  // if (!wrapperTr) return false;

  // Sortable.create(wrapperTr, {
  //   filter: ".ignore-elements",
  //   draggable: ".draggable",
  //   animation: 180,
  //   delay: 0,
  //   onEnd: (evt: { newIndex: any; oldIndex: any }) => {
  //     if (
  //       pData.value.tableSetUp.showSelection &&
  //       pData.value.tableSetUp?.tableColumns
  //     ) {
  //       const oldItem = pData.value.tableSetUp.tableColumns.splice(
  //         evt.oldIndex - 1,
  //         1
  //       )[0];
  //       pData.value.tableSetUp?.tableColumns.splice(
  //         evt.newIndex - 1,
  //         0,
  //         oldItem
  //       );
  //     } else if (pData.value.tableSetUp.tableColumns) {
  //       const oldItem = pData.value.tableSetUp?.tableColumns.splice(
  //         evt.oldIndex,
  //         1
  //       )[0];
  //       pData.value.tableSetUp?.tableColumns.splice(evt.newIndex, 0, oldItem);
  //     }
  //   },
  // });
};

// 合计
const getSummaries = (param: Domains.SummaryMethodProps) => {
  const { columns, data } = param;
  const sums: string[] = [];
  columns.forEach((column, index) => {
    if (index === 0 && pData.value.tableSetUp.showSelection) {
      sums[index] = "合计";
      return;
    }
    const values = data.map((item: any) => Number(item[column?.property]));
    // 可以指定列计算，默认全部列
    if (
      (Array.isArray(pData.value.tableSetUp.showSummary) &&
        pData.value.tableSetUp.showSummary?.indexOf(column?.property) !== -1) ||
      pData.value.tableSetUp.showSummary == true
    ) {
      if (!values.every((value) => Number.isNaN(value))) {
        sums[index] = `${values.reduce((prev, curr) => {
          const value = Number(curr);
          if (!Number.isNaN(value)) {
            return prev + curr;
          } else {
            return prev;
          }
        }, 0)}`;
      } else {
        sums[index] = "";
      }
    } else {
      sums[index] = "";
    }
  });
  return sums;
};

let pageSize: any = ref(
  pData.value.tableSetUp.showPagination?.pageSize
    ? pData.value.tableSetUp.showPagination?.pageSize
    : pData.value.tableSetUp?.showPagination?.pageSizeOptions[0]
);
let pageSizeList = ref(); // 未优化的数据
let startIndex = ref(0); // 列表起始位置
let endIndex = ref(0); // 列表结束位置

// 分页
const sizeChange = (e: any) => {
  pageSize.value = e;
  pageSizeList.value = dataGrouping(props.tableData, e, 1);
  emits("paginationQuery", e, 1);
  if (e >= 50 && pData.value.tableSetUp.virtualList) {
    // 开启虚拟列表的时候默认只展示50条DOM
    pData.value.tableData = pageSizeList.value.slice(0, 50);
  } else {
    pData.value.tableData = pageSizeList.value.slice(0, e);
  }
};

// 当前页
const currentChange = (e: any) => {
  emits("currentChange", e);
  pData.value.tableData = dataGrouping(props.tableData, pageSize.value, e);
};

onUpdated(() => {
  // 动态获取表格高度
  const tabel = document.getElementById(`${randomId.value}`);
  const arr = tabel?.getElementsByClassName("el-table__inner-wrapper");
  const target = arr ? arr[0] : {};
});

// 虚拟列表
const handlerLazyLoad = (e: any) => {
  if (
    (pageSize && pageSize.value > 500) ||
    pData.value.tableSetUp.virtualList
  ) {
    startIndex.value = Math.floor(e.target.scrollTop / 50);
    endIndex.value = startIndex.value + Math.ceil(500 / 50);
    pData.value.tableData = pageSizeList.value.slice(
      startIndex.value,
      endIndex.value + 20
    );
    const tabel = document.getElementById(`${randomId.value}`);
    const arr = tabel?.getElementsByClassName("el-table__body");
    if (arr) {
      const target = arr[0] as HTMLImageElement;
      target.style.transform = `translate3D(0,${startIndex.value * 50}px,0)`;
    }
  }
};

// 虚拟列表
const lazyLoading = () => {
  nextTick(() => {
    const tabel = document.getElementById(`${randomId.value}`);
    const arr = tabel?.getElementsByClassName("el-scrollbar__wrap");
    const target = arr ? arr[arr.length - 1] : null;
    if (target) target.addEventListener("scroll", handlerLazyLoad);
  });
};

onMounted(() => {
  // 需要分页的时候的数据处理
  if (pData.value.tableSetUp.showPagination) {
    if (pData.value.tableSetUp.showPagination) {
      pData.value.tableData = dataGrouping(props.tableData, pageSize.value, 1);
    } else {
      pData.value.tableData = dataGrouping(props.tableData, 10, 1);
    }
  }

  // 拖拽开关
  if (pData.value.tableSetUp.draggable == true) {
    columnDrop();
  }
  // 数据量大于某个值时开启虚拟列表
  //   if (props.tableData.length > 500 || pData.value.tableSetUp.virtualList) {
  if (pData.value.tableSetUp.virtualList) {
    // 绑定事件
    nextTick(() => {
      lazyLoading();
    });
  }
});

// 高级搜索
const advancedSearch = () => {};

// 动态设置行style样式
const rowStyle = (row: any, rowIndex: any): any => {
  emits("rowStyle", row, rowIndex);
};

// 自适应高度
const adaptiveHeight = () => {};

defineExpose({
  tableRef,
  setCurrentRow,
});
</script>
<template>
  <div :id="randomId" :class="tableClass" v-loading="loading">
    <el-table
      :row-key="pData.tableSetUp.id"
      ref="tableRef"
      :border="haveBorder"
      :row-style="rowStyle"
      header-row-class-name="header-row-class-name"
      :header-cell-style="pData.tableSetUp.headerCellStyle || { 'text-align': 'left' }"
      :cell-style="pData.tableSetUp.cellStyle"
      :data="pData.tableData"
      :max-height="pData.tableSetUp.maxHeight"
      :highlight-current-row="pData.tableSetUp.highlightCurrentRow"
      :scrollbar-always-on="pData.tableSetUp.scrollbarAlwaysOn"
      :sort-orders="pData.tableSetUp.sortOrders"
      :default-sort="{ prop: 'column-0', order: 'descending' }"
      :show-summary="showSummary"
      :summary-method="getSummaries"
      @row-click="getDetails"
      @row-dblclick="rowDblClick"
      @selection-change="handleSelectionChange"
      @sort-change="changeTableSort"
      @current-change="handleCurrentChange"
      style="
        width: 100%;
        min-height: 300px;
        height: calc(100% - 60px);
        max-height: 720px;
      "
    >
      <el-table-column
        v-if="pData.tableSetUp.showSelection"
        class-name="ignore-elements"
        :selectable="selectFn"
        type="selection"
        width="60"
      />
      <!-- 可编辑 表格 -->
      <template v-if="pData.tableSetUp.readonly == false">
        <!-- 可编辑中默认都是可以编辑的 -->
        <el-table-column
          class-name="draggable"
          v-for="(item, index) in pData.tableSetUp.tableColumns"
          :key="`column_${item.prop}_${index}`"
          :resizable="true"
          :formatter="item.formatter"
          :type="item.type"
          :width="item.width"
          :show-overflow-tooltip="showOverflowTooltip(item.showOverflowTooltip)"
          :prop="item.prop"
          :min-width="item.minWidth"
          :label="item.label"
          :fixed="item.fixed"
          :align="item.align || 'left'"
        >
          <!-- 表头问号解释说明 -->
          <template #header>
            <div v-if="item.description">
              {{ item.label }}
              <el-tooltip effect="dark" placement="top-start">
                <template #content style="color: #fff">
                  <slot :name="item.prop + `_describe`" />
                </template>
                <span class="question-icon">?</span>
              </el-tooltip>
            </div>
          </template>
          <!-- <template #header v-if="item.required">
            <span style="color: red">*</span>{{ " " + item.label }}
          </template> -->
          <template
            #default="scope"
            v-if="item.slotName != null && item.slotName != ''"
          >
            <slot
              :key="`input_${scope.$index}_${index}`"
              :name="item.slotName"
              :item="scope"
              :index="scope.$index"
              :prop="scope.row[item.prop]"
            >
            </slot>
          </template>

          <template #default="scope" v-else>
            <el-input
              v-if="!item.readonly && item.prop !== 'index'"
              :key="`input_${scope.$index}_${index}`"
              v-model="scope.row[item.prop]"
            />
            <span v-if="item.prop == 'index'">{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <!-- 单独有某行不想可编辑 -->
        <!-- 常见的3个按钮形式 -->
        <el-table-column
          v-if="pData.tableSetUp.showOperation"
          class-name="ignore-elements"
          key="操作"
          label="操作"
          :width="230"
          fixed="right"
          :align="'left'"
        >
          <template v-slot="scope">
            <el-button
              type="danger"
              v-if="pData.tableSetUp.showOperation.showDelLine"
              @click.native.stop="handleDelete(scope.$index, scope.row)"
              >删除</el-button
            >
            <el-button
              type="primary"
              v-if="pData.tableSetUp.showOperation.showEditLine"
              @click.native.stop="handleEdit(scope.$index, scope.row)"
              >编辑</el-button
            >
            <el-button
              type="success"
              v-if="pData.tableSetUp.showOperation.showView"
              @click.native.stop="handleView(scope.$index, scope.row)"
              >查看</el-button
            >
          </template>
        </el-table-column>
      </template>

      <!-- 不可编辑表格 -->
      <template v-else>
        <el-table-column
          class-name="draggable"
          :resizable="true"
          v-for="(item, index) in pData.tableSetUp.tableColumns"
          :key="`column_${item.prop}_${index}`"
          :formatter="
            (e: any) => {
              if (item.formatter == 'time' && e[item.prop]) {
                return dayjs(e[item.prop]).format('YYYY-MM-DD') || ' - ';
              }
              if (e[item.prop]) {
                if (
                  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(e[item.prop])
                ) {
                  return dayjs(e[item.prop]).format('YYYY-MM-DD') || ' - ';
                } else {
                  return e[item.prop] || ' - ';
                }
              } else {
                return ' - ';
              }
            }
          "
          :width="item.width"
          :type="item.type"
          :show-overflow-tooltip="showOverflowTooltip(item.showOverflowTooltip)"
          :prop="item.prop"
          :min-width="item.minWidth"
          :label="item.label"
          :fixed="item.fixed"
          :align="item.align || 'left'"
        >
          <!-- 表头的问号解释说明 -->
          <template #header v-if="item.description">
            <div>
              {{ item.label }}
              <el-tooltip effect="dark" placement="top-start">
                <template #content style="color: #fff">
                  <slot :name="item.prop + `_describe`" />
                </template>
                <span class="question-icon">?</span>
              </el-tooltip>
            </div>
          </template>
          <template
            v-if="item.slotName != null && item.slotName != ''"
            #default="scope"
          >
            <slot
              :item="scope.row[item.prop]"
              :name="item.slotName"
              :scope="scope"
              :row="scope.row"
            >
              {{ scope.row[item.prop] }}
            </slot>
          </template>
        </el-table-column>
        <el-table-column
          v-if="pData.tableSetUp.showOperation"
          class-name="ignore-elements"
          key="操作"
          label="操作"
          :width="230"
          fixed="right"
          :align="'left'"
        >
          <template v-slot="scope">
            <el-button
              type="danger"
              v-if="pData.tableSetUp.showOperation.showDelLine"
              @click.native.stop="handleDelete(scope.$index, scope.row)"
              >删除</el-button
            >
            <el-button
              type="primary"
              v-if="pData.tableSetUp.showOperation.showEditLine"
              @click.native.stop="handleEdit(scope.$index, scope.row)"
              >编辑</el-button
            >
            <el-button
              type="success"
              v-if="pData.tableSetUp.showOperation.showView"
              @click.native.stop="handleView(scope.$index, scope.row)"
              >查看</el-button
            >
          </template>
        </el-table-column>
      </template>
    </el-table>
    <el-row style="margin-top: 5px">
      <el-col
        :span="24"
        style="text-align: center"
        v-if="isShowPagination && pData.tableSetUp.showPagination"
      >
        <P-Pagination
          :totals="
            pData.tableSetUp.showPagination.totals || pData.tableData.length
          "
          :currentPage="pData.tableSetUp.showPagination.currentPage"
          :pager-count="pData.tableSetUp.showPagination.pagerCount"
          :pageSizes="pData.tableSetUp.showPagination.pageSize"
          :pageSizeOptions="pData.tableSetUp.showPagination.pageSizeOptions"
          @sizeChange="sizeChange"
          @currentChange="currentChange"
        ></P-Pagination>
      </el-col>
      <el-col :span="4" v-if="pData.tableSetUp.advancedSearch">
        <el-tooltip content="高级搜索" placement="top" :open-delay="500">
          <el-button
            type="primary"
            link
            style="
              float: right;
              font-size: 16px;
              padding-top: 7px;
              padding-bottom: 7px;
            "
            class="iconfont icon-sousuo"
            @click="advancedSearch"
          >
          </el-button>
        </el-tooltip>
      </el-col>
    </el-row>
  </div>
</template>
<style lang="less" scoped>
.tabel-default {
  width: 100%;
  height: 100%;
}
.question-icon {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  border: solid 1px #8f9195;
  color: #8f9195;
  line-height: 14px;
  font-size: 12px;
  text-align: center;
}
.draggable {
  background-color: rgb(35, 156, 255);
}
</style>
