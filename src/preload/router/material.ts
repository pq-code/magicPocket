/**
 * 物料 API 路由（Express）
 * GET    /api/materials              - 分页列表
 * GET    /api/materials/:materialId  - 单个物料
 * POST   /api/materials              - 创建
 * PATCH  /api/materials/:materialId  - 更新
 * DELETE /api/materials/:materialId  - 删除
 * POST   /api/materials/seed         - 填充默认物料
 */
import express from 'express'
import * as materialController from '../controller/material.controller'

const router = express.Router()

router.get('/materials', materialController.list)
router.post('/materials/seed', materialController.seed)
router.get('/materials/:materialId', materialController.getOne)
router.post('/materials', materialController.create)
router.patch('/materials/:materialId', materialController.update)
router.delete('/materials/:materialId', materialController.remove)

export default router
