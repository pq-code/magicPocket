import type { Request, Response } from 'express'
import * as materialService from '../service/material.service'

/** GET /api/materials - 分页列表，query: page, pageSize, group, search, createdBy */
export async function list(req: Request, res: Response) {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      group: req.query.group as string | undefined,
      search: req.query.search as string | undefined,
      createdBy: req.query.createdBy as string | undefined,
      status: req.query.status as string | undefined
    }
    const result = await materialService.materialList(query)
    const list = (result.list as any[]).map((r) => (r.get ? r.get({ plain: true }) : r))
    res.json({ code: 0, result: { list, total: result.total } })
  } catch (e: any) {
    res.status(500).json({ code: -1, message: e?.message || '列表失败' })
  }
}

/** GET /api/materials/:materialId - 单个物料 */
export async function getOne(req: Request, res: Response) {
  try {
    const id = Number(req.params.materialId)
    if (Number.isNaN(id)) {
      res.status(400).json({ code: -1, message: '无效 materialId' })
      return
    }
    const row = await materialService.materialGetById(id)
    if (!row) {
      res.status(404).json({ code: -1, message: '物料不存在' })
      return
    }
    const plain = (row as any).get ? (row as any).get({ plain: true }) : row
    res.json({ code: 0, result: plain })
  } catch (e: any) {
    res.status(500).json({ code: -1, message: e?.message || '获取失败' })
  }
}

/** POST /api/materials - 创建或更新物料（按 type 幂等），body 同 ComponentMeta */
export async function create(req: Request, res: Response) {
  try {
    const body = req.body || {}
    if (!body.type || !body.componentName) {
      res.status(400).json({ code: -1, message: '缺少 type 或 componentName' })
      return
    }
    const row = await materialService.materialCreateOrUpdate({
      ...body,
      createdBy: body.createdBy ?? (req as any).user?.userId,
      userName: body.userName ?? (req as any).user?.userName
    })
    const id = (row as any).id ?? (row as any).get?.('id')
    res.json({ code: 0, result: { id } })
  } catch (e: any) {
    res.status(500).json({ code: -1, message: e?.message || '创建失败' })
  }
}

/** PATCH /api/materials/:materialId - 更新物料 */
export async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.materialId)
    if (Number.isNaN(id)) {
      res.status(400).json({ code: -1, message: '无效 materialId' })
      return
    }
    const body = req.body || {}
    const row = await materialService.materialUpdate(id, body)
    if (!row) {
      res.status(404).json({ code: -1, message: '物料不存在' })
      return
    }
    res.json({ code: 0, result: row })
  } catch (e: any) {
    res.status(500).json({ code: -1, message: e?.message || '更新失败' })
  }
}

/** DELETE /api/materials/:materialId - 删除物料 */
export async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.materialId)
    if (Number.isNaN(id)) {
      res.status(400).json({ code: -1, message: '无效 materialId' })
      return
    }
    const ok = await materialService.materialDelete(id)
    if (!ok) {
      res.status(404).json({ code: -1, message: '物料不存在' })
      return
    }
    res.json({ code: 0 })
  } catch (e: any) {
    res.status(500).json({ code: -1, message: e?.message || '删除失败' })
  }
}

/** POST /api/materials/seed - 填充默认物料（幂等） */
export async function seed(req: Request, res: Response) {
  try {
    const body = req.body || {}
    const result = await materialService.materialSeed(body.createdBy, body.userName)
    res.json({ code: 0, result })
  } catch (e: any) {
    res.status(500).json({ code: -1, message: e?.message || 'seed 失败' })
  }
}
