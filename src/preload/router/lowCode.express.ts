/**
 * 低代码配置 API 路由（Express），本地 /lowCode
 */
import express from 'express'
import * as lowCodeController from '../controller/lowCode.express'

const router = express.Router()

router.post('/listCodeConfigs', lowCodeController.listCodeConfigs)
router.post('/getCodeConfig', lowCodeController.getCodeConfig)
router.post('/saveCodeConfig', lowCodeController.saveCodeConfig)
router.post('/editCodeConfig', lowCodeController.editCodeConfig)
router.post('/deleteCodeConfig', lowCodeController.deleteCodeConfig)

export default router
