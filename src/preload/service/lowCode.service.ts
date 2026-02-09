/**
 * 低代码配置 service：save/edit/get 画布 JSON
 */
import { lowCodeConfig } from '../model/lowCodeConfig.model'

export interface CodeConfigBody {
  codeConfigId?: string
  codeConfigName?: string
  codeConfig?: object
  userId?: string
  userName?: string
}

/** 列出所有配置（分页）：返回 codeConfigId、codeConfigName、createdAt 等 */
export async function listCodeConfigs(params?: { page?: number; pageSize?: number }) {
  const page = Math.max(1, params?.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 50))
  const offset = (page - 1) * pageSize
  const { count, rows } = await lowCodeConfig.findAndCountAll({
    attributes: ['id', 'codeConfigId', 'codeConfigName', 'userId', 'userName', 'createdAt', 'updatedAt'],
    order: [['updatedAt', 'DESC']],
    limit: pageSize,
    offset
  })
  const list = rows.map((r) => (r.get ? r.get({ plain: true }) : r))
  return { list, total: count }
}

/** 获取配置：按 codeConfigId 或 codeConfigName */
export async function getCodeConfig(params: { codeConfigId?: string; codeConfigName?: string }) {
  const where: Record<string, string> = {}
  if (params.codeConfigId) where.codeConfigId = params.codeConfigId
  if (params.codeConfigName) where.codeConfigName = params.codeConfigName
  if (Object.keys(where).length === 0) return null
  const row = await lowCodeConfig.findOne({ where })
  return row ? (row.get ? row.get({ plain: true }) : row) : null
}

/** 保存配置：有则更新，无则创建 */
export async function saveCodeConfig(body: CodeConfigBody) {
  const { codeConfigId, codeConfigName, codeConfig, userId, userName } = body
  if (!codeConfigId || !codeConfigName || codeConfig == null) {
    throw new Error('缺少 codeConfigId / codeConfigName / codeConfig')
  }
  const payload = {
    codeConfigId,
    codeConfigName,
    codeConfig: typeof codeConfig === 'string' ? codeConfig : JSON.stringify(codeConfig),
    userId: userId || 'local',
    userName: userName || 'local'
  }
  const row = await lowCodeConfig.findOne({ where: { codeConfigId } })
  if (row) {
    await row.update(payload)
    return row
  }
  return await lowCodeConfig.create(payload)
}

/** 删除配置：按 codeConfigId */
export async function deleteCodeConfig(codeConfigId: string) {
  const row = await lowCodeConfig.findOne({ where: { codeConfigId } })
  if (!row) return false
  await row.destroy()
  return true
}

/** 编辑配置：按 codeConfigId 更新 */
export async function editCodeConfig(body: CodeConfigBody) {
  const { codeConfigId, codeConfigName, codeConfig, userId, userName } = body
  if (!codeConfigId) throw new Error('缺少 codeConfigId')
  const row = await lowCodeConfig.findOne({ where: { codeConfigId } })
  if (!row) return null
  const updates: Record<string, unknown> = {}
  if (codeConfigName != null) updates.codeConfigName = codeConfigName
  if (codeConfig != null) updates.codeConfig = typeof codeConfig === 'string' ? codeConfig : JSON.stringify(codeConfig)
  if (userId != null) updates.userId = userId
  if (userName != null) updates.userName = userName
  await row.update(updates)
  return row
}
