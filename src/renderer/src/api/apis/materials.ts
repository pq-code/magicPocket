/**
 * 物料 API（本地 Node /api 代理到 3000）
 * - 不依赖 127.0.0.1:3001 物料平台
 * - 与 ComponentMeta 结构对齐（type、componentName、group、npm、props 等）
 */
import { http } from '@renderer/api'
import type { ComponentMeta } from '@renderer/type/definitionComponent'

/** 物料分页列表 query */
export interface MaterialListQuery {
  page?: number
  pageSize?: number
  group?: string
  search?: string
  createdBy?: string
  status?: string
}

/** 物料列表响应 */
interface MaterialListRes {
  code?: number
  result?: { list?: ComponentMeta[]; total?: number }
}

/** 物料单项响应 */
interface MaterialItemRes {
  code?: number
  result?: ComponentMeta | { id?: number }
}

/**
 * 获取物料分页列表（低代码左侧列表）
 */
export async function getMaterials(query: MaterialListQuery = {}): Promise<ComponentMeta[]> {
  const { page = 1, pageSize = 200, group, search, createdBy, status } = query
  const params: Record<string, string | number> = { page, pageSize }
  if (group) params.group = group
  if (search) params.search = search
  if (createdBy) params.createdBy = createdBy
  if (status) params.status = status

  const res = (await http.get<MaterialListRes>('/api/materials', { params })) as MaterialListRes
  const list = res?.result?.list ?? (res as any)?.list ?? []
  return Array.isArray(list) ? list : []
}

/**
 * 获取单个物料（按 id）
 */
export async function getMaterial(materialId: string | number): Promise<ComponentMeta | null> {
  try {
    const res = (await http.get<MaterialItemRes>(`/api/materials/${materialId}`)) as MaterialItemRes
    const item = res?.result as ComponentMeta
    return item ?? null
  } catch {
    return null
  }
}

/**
 * 创建物料（body 同 ComponentMeta）
 */
export async function createMaterial(body: ComponentMeta): Promise<{ id?: number } | null> {
  try {
    const res = (await http.post<MaterialItemRes>('/api/materials', body)) as MaterialItemRes
    const result = res?.result as { id?: number }
    return result ?? null
  } catch {
    return null
  }
}

/**
 * 更新物料
 */
export async function updateMaterial(
  materialId: string | number,
  body: Partial<ComponentMeta>
): Promise<boolean> {
  try {
    await http.patch(`/api/materials/${materialId}`, body)
    return true
  } catch {
    return false
  }
}

/**
 * 删除物料
 */
export async function deleteMaterial(materialId: string | number): Promise<boolean> {
  try {
    await http.delete(`/api/materials/${materialId}`)
    return true
  } catch {
    return false
  }
}

/**
 * 填充默认物料（幂等）
 */
export async function seedMaterials(createdBy?: string, userName?: string): Promise<{ inserted?: number; total?: number } | null> {
  try {
    const res = await http.post<{ code?: number; result?: { inserted: number; total: number } }>(
      '/api/materials/seed',
      { createdBy, userName }
    )
    return (res as any)?.result ?? null
  } catch {
    return null
  }
}

// ===== 以下保留兼容，本地模式下无需登录 =====
export async function loginMaterialPlatform(_params?: { userId: string; password: string }): Promise<string | null> {
  return 'local'
}

export function getMaterialPlatformToken(): string | null {
  return 'local'
}

export function clearMaterialPlatformToken(): void {
  // no-op
}

export async function logoutMaterialPlatform(): Promise<void> {
  // no-op
}
