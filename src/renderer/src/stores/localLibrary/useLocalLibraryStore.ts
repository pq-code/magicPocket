/**
 * 本地组件库 Store
 * 扫描到的组件列表会写入此处，供 materialArea 与拖拽画布合并使用
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ComponentMeta } from '@renderer/type/definitionComponent'

export const useLocalLibraryStore = defineStore('localLibrary', () => {
  /** 本地组件库扫描到的组件列表（与 materialArea 静态列表合并） */
  const localLibraryComponents = ref<ComponentMeta[]>([])

  function setLocalLibraryComponents(components: ComponentMeta[]) {
    localLibraryComponents.value = components
  }

  function clearLocalLibraryComponents() {
    localLibraryComponents.value = []
  }

  return {
    localLibraryComponents,
    setLocalLibraryComponents,
    clearLocalLibraryComponents
  }
})
