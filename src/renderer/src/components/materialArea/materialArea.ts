/**
 * 物料库：低代码左侧「可拖拽组件列表」的数据源（前端聚合层）
 *
 * 统一合并两类物料：
 * - 本地组件库扫描得到的物料（useLocalLibraryStore）
 * - 物料平台云端物料（useMaterialsStore）
 *
 * 同一个 type 的物料优先级：platform > local
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocalLibraryStore } from '@renderer/stores/localLibrary/useLocalLibraryStore'
import { useMaterialsStore } from '@renderer/stores/materials/useMaterialsStore'
import type { ComponentMeta } from '@renderer/type/definitionComponent'

/**
 * 合并后的物料列表：
 * - local: 本地组件库
 * - platform: 物料平台云端物料
 *
 * 注意：这里只负责“聚合 + 决策优先级”，不做 UI 排序逻辑。
 */
const componentList = computed<ComponentMeta[]>(() => {
  const materialsStore = useMaterialsStore()
  const localStore = useLocalLibraryStore()
  const { localLibraryComponents } = storeToRefs(localStore)

  const merged: Record<string, ComponentMeta> = {}

  // 1. 本地组件库物料（local）
  for (const comp of localLibraryComponents.value as ComponentMeta[]) {
    merged[comp.type] = {
      ...comp,
      materialSource: comp.materialSource ?? 'local',
    }
  }

  // 2. 物料平台云端物料（platform）
  for (const item of materialsStore.list as ComponentMeta[]) {
    merged[item.type] = {
      ...item,
      materialSource: item.materialSource ?? 'platform',
    }
  }

  return Object.values(merged)
})

/**
 * type -> ComponentMeta 映射，供渲染器等按 type 直接取 meta。
 */
const componentMap = computed<Record<string, ComponentMeta>>(() => {
  const materialsStore = useMaterialsStore()
  const localStore = useLocalLibraryStore()
  const { localLibraryComponents } = storeToRefs(localStore)
  const merged: Record<string, ComponentMeta> = {}

  // 1. 本地组件库物料（local）
  for (const comp of localLibraryComponents.value as ComponentMeta[]) {
    merged[comp.type] = {
      ...comp,
      materialSource: comp.materialSource ?? 'local',
    }
  }

  // 2. 物料平台云端物料（platform）
  for (const item of materialsStore.list as ComponentMeta[]) {
    merged[item.type] = {
      ...item,
      materialSource: item.materialSource ?? 'platform',
    }
  }

  return merged
})

function setComponentList() {
  // 兼容旧接口：现在由 computed 自动驱动，无需手动设置
}

export { componentList, componentMap, setComponentList }

