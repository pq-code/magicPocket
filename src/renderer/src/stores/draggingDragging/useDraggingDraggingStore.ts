import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDraggingDraggingStore = defineStore('draggingDraggingStore', () => {
  // 页面JSON
  // const pageJSON = ref({
  //   type: 'page',
  //   title: '首页标题',
  //   csssName: '测试一下',
  //   Style: '',
  //   children: {
  //     type: 'form',
  //     mode: 'horizontal',
  //     api: '/saveForm',
  //     children: [
  //       {
  //         label: 'Name',
  //         type: 'input-text',
  //         name: 'name'
  //       },
  //       {
  //         label: 'Email',
  //         type: 'input-email',
  //         name: 'email'
  //       }
  //     ]
  //   }
  // })
  const pageJSON = ref([])
  return { pageJSON }

})
