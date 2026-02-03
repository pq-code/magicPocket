/**
 * 用户 API 路由（Express），本地 /users
 */
import express from 'express'
import * as userController from '../controller/user.express'

const router = express.Router()

router.post('/login', userController.login)
router.post('/outLogin', userController.outLogin)
router.post('/getUerInfo', userController.getUerInfo)

export default router
