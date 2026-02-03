/**
 * 物料 Store：从本地 Node /api/materials 拉取物料，供低代码左侧列表使用
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ComponentMeta } from '@renderer/type/definitionComponent'
import { getMaterials, logoutMaterialPlatform } from '@renderer/api/apis/materials'

export const useMaterialsStore = defineStore('materials', () => {
  /** 从本地接口拉取的物料列表（已上架） */
  const list = ref<ComponentMeta[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** 是否已拉取过 */
  const hasFetched = computed(() => list.value.length > 0 || error.value !== null)

  /** 拉取物料列表（低代码页进入时调用，本地模式无需登录） */
  async function loginAndFetch() {
    loading.value = true
    error.value = null
    try {
      const items = await getMaterials({ page: 1, pageSize: 200 })
      list.value = Array.isArray(items) ? items : []
    } catch (e: any) {
      error.value = e?.message || '拉取物料列表失败'
      list.value = []
    } finally {
      loading.value = false
    }
  }

  /** 刷新列表 */
  async function refreshList() {
    loading.value = true
    error.value = null
    try {
      const items = await getMaterials({ page: 1, pageSize: 200 })
      list.value = Array.isArray(items) ? items : []
    } catch (e: any) {
      error.value = e?.message || '拉取物料列表失败'
    } finally {
      loading.value = false
    }
  }

  function clearList() {
    list.value = []
    error.value = null
  }

  /** 清空列表（保留接口兼容） */
  async function logout() {
    logoutMaterialPlatform()
    clearList()
  }

  return {
    list,
    loading,
    error,
    hasFetched,
    loginAndFetch,
    refreshList,
    clearList,
    logout
  }
})
