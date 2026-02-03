import { Op } from 'sequelize'
import { materialModel, MATERIAL_STATUS } from '../model/material.model'
import { defaultMaterials } from '../data/defaultMaterials'
import type { DefaultMaterialRow } from '../data/defaultMaterials'

export interface MaterialListQuery {
  page?: number
  pageSize?: number
  group?: string
  search?: string
  createdBy?: string
  status?: string
}

/** 分页列表 */
export async function materialList(query: MaterialListQuery) {
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(200, Math.max(1, query.pageSize ?? 50))
  const offset = (page - 1) * pageSize
  const where: Record<string, unknown> = {}
  if (query.status) where.status = query.status
  else where.status = MATERIAL_STATUS.PUBLISHED
  if (query.group) where.group = query.group
  if (query.createdBy) where.createdBy = query.createdBy
  if (query.search) {
    (where as any)[Op.or] = [
      { type: { [Op.like]: `%${query.search}%` } },
      { componentName: { [Op.like]: `%${query.search}%` } }
    ]
  }
  const { count, rows } = await materialModel.findAndCountAll({
    where: Object.keys(where).length ? where : undefined,
    limit: pageSize,
    offset,
    order: [['id', 'ASC']]
  })
  return { list: rows, total: count }
}

/** 按 id 获取 */
export async function materialGetById(id: number) {
  const row = await materialModel.findByPk(id)
  return row
}

/** 按 type 获取（用于去重） */
export async function materialGetByType(type: string) {
  const row = await materialModel.findOne({ where: { type } })
  return row
}

/** 创建 */
export async function materialCreate(data: Partial<DefaultMaterialRow> & { createdBy?: string; userName?: string }) {
  const row = await materialModel.create({
    type: data.type,
    componentName: data.componentName,
    group: data.group ?? '',
    icon: data.icon ?? null,
    npm: data.npm ?? null,
    props: data.props ?? null,
    fnEvent: data.fnEvent ?? null,
    children: data.children ?? null,
    status: MATERIAL_STATUS.PUBLISHED,
    createdBy: data.createdBy ?? null,
    userName: data.userName ?? null
  })
  return row
}

/** 创建或按 type 更新（幂等，用于发布时） */
export async function materialCreateOrUpdate(data: Partial<DefaultMaterialRow> & { createdBy?: string; userName?: string }) {
  const existing = await materialGetByType(data.type!)
  if (existing) {
    const updated = await materialUpdate((existing as any).id, {
      type: data.type,
      componentName: data.componentName,
      group: data.group,
      icon: data.icon,
      npm: data.npm,
      props: data.props,
      fnEvent: data.fnEvent,
      children: data.children
    })
    return updated!
  }
  return materialCreate(data)
}

/** 更新 */
export async function materialUpdate(
  id: number,
  data: Partial<DefaultMaterialRow> & { status?: string }
) {
  const row = await materialModel.findByPk(id)
  if (!row) return null
  await row.update({
    ...(data.type != null && { type: data.type }),
    ...(data.componentName != null && { componentName: data.componentName }),
    ...(data.group != null && { group: data.group }),
    ...(data.icon != null && { icon: data.icon }),
    ...(data.npm != null && { npm: data.npm }),
    ...(data.props != null && { props: data.props }),
    ...(data.fnEvent != null && { fnEvent: data.fnEvent }),
    ...(data.children != null && { children: data.children }),
    ...(data.status != null && { status: data.status })
  })
  return row
}

/** 删除 */
export async function materialDelete(id: number) {
  const row = await materialModel.findByPk(id)
  if (!row) return false
  await row.destroy()
  return true
}

/** 填充默认物料（按 type 不存在则插入，幂等） */
export async function materialSeed(createdBy?: string, userName?: string) {
  let inserted = 0
  for (const item of defaultMaterials) {
    const exists = await materialGetByType(item.type)
    if (!exists) {
      await materialCreate({
        ...item,
        createdBy: createdBy ?? 'system',
        userName: userName ?? 'system'
      })
      inserted++
    }
  }
  return { inserted, total: defaultMaterials.length }
}
