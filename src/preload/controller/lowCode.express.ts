/**
 * 低代码配置接口（Express），供本地 /lowCode 路由使用
 */
import type { Request, Response } from 'express'
import * as lowCodeService from '../service/lowCode.service'

/** POST /lowCode/getCodeConfig - body: { codeConfigId?, codeConfigName? } */
export async function getCodeConfig(req: Request, res: Response) {
  try {
    const body = req.body || {}
    const row = await lowCodeService.getCodeConfig({
      codeConfigId: body.codeConfigId,
      codeConfigName: body.codeConfigName
    })
    if (!row) {
      res.json({ code: 0, result: { codeConfig: null } })
      return
    }
    const codeConfig = typeof (row as any).codeConfig === 'string'
      ? JSON.parse((row as any).codeConfig)
      : (row as any).codeConfig
    res.json({ code: 0, result: { ...row, codeConfig } })
  } catch (e: any) {
    res.status(500).json({ code: -1, message: e?.message || '获取配置失败' })
  }
}

/** POST /lowCode/saveCodeConfig - body: { codeConfigId, codeConfigName, codeConfig, userId?, userName? } */
export async function saveCodeConfig(req: Request, res: Response) {
  try {
    const body = req.body || {}
    await lowCodeService.saveCodeConfig(body)
    res.json({ code: 0 })
  } catch (e: any) {
    res.status(500).json({ code: -1, message: e?.message || '保存配置失败' })
  }
}

/** POST /lowCode/editCodeConfig - body: { codeConfigId, codeConfigName?, codeConfig?, userId?, userName? } */
export async function editCodeConfig(req: Request, res: Response) {
  try {
    const body = req.body || {}
    await lowCodeService.editCodeConfig(body)
    res.json({ code: 0 })
  } catch (e: any) {
    res.status(500).json({ code: -1, message: e?.message || '编辑配置失败' })
  }
}
