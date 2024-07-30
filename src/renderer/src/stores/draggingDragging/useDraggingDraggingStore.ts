import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDraggingDraggingStore = defineStore('draggingDraggingStore', () => {
  // 页面JSON
  const pageJSON = ref({
    type: 'page',
    title: '页面',
    whetherYouCanDrag: true,
    props: {
      className: 'PageContainer',
      style: '',
    },
    children: [
    ]
  })

  // const pageJSON = ref([])
  const currentDragObject = ref({}) // 当前拖拽对象

  const currentEnvironment = ref(true) // 当前环境

  return { pageJSON, currentDragObject, currentEnvironment }

})
