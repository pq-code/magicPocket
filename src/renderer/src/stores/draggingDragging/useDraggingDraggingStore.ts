import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDraggingDraggingStore = defineStore('draggingDraggingStore', () => {
  // 页面JSON
  const pageJSON = ref({
    type: 'page',
    title: '首页标题',
    props: {
      className: 'PageContainer',
      style: '',
    },
    children: [
    ]
  })
  // const pageJSON = ref([])
  const currentDragObject = ref({}) // 当前拖拽对象
  return { pageJSON, currentDragObject }

})
