<script setup lang="ts">
import { ref, onMounted } from "vue";
const emits = defineEmits(["sizeChange", "currentChange"]);

const props = defineProps({
  totals: {
    type: Number,
    default: 100,
  },
  pageSizes: {
    type: Number,
    default: 50,
  },
  pageSizeOptions: {
    type: Array,
    default() {
      return [50, 100, 200, 500, 1000];
    },
  },
  background: {
    type: Boolean,
    default: false,
  },
  pagerCount: {
    type: Number,
    default: 5,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
});

const pageSize = ref(props.pageSizes);
const total = ref();
// const currentPages = ref(props.currentPage);

const sizeChange = (e: any) => {
  pageSize.value = e;
  emits("sizeChange", e);
};

const currentChange = (e: number) => {
  // currentPages.value = e
  emits("currentChange", e);
};

// watch(
//   () => props.currentPage,
//   (n,o) => {
//     console.log(n,o);
//     debugger
//     // total.value = props.totals;
//   }
// );

console.log("totals", props.totals);

onMounted(() => {
  sizeChange(props.pageSizes || props.pageSizeOptions[0]);
});
</script>
<template>
  <div class="pagination">
    <el-pagination
      :total="totals"
      :current-page="currentPage"
      :page-size="pageSize"
      :background="background"
      :pager-count="pagerCount"
      :page-sizes="pageSizeOptions"
      layout="prev, pager, next, jumper, sizes, total"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
    </el-pagination>
  </div>
</template>

<style lang="less" scoped>
.pagination {
  padding: 10px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
