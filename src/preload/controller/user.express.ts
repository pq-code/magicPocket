/**
 * 用户相关接口（Express），供本地 /users 路由使用
 */
import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '../model/user.model'
import { userServiceGetUerInfo, UserServiceCreateUser, userServiceUpdateById } from '../service/user.service'
import { guid } from '../utils/index'

/** POST /users/login - 本地登录，body: { userName, userPassword } 或 { userId, password } */
export async function login(req: Request, res: Response) {
  try {
    const body = req.body || {}
    const userName = body.userName ?? body.userId
    const userPassword = body.userPassword ?? body.password
    if (!userName || !userPassword) {
      res.status(400).json({ code: -1, message: '缺少 userName/userPassword 或 userId/password' })
      return
    }
    let user: any = await User.findOne({ where: { userName } })
    if (!user) {
      const salt = bcrypt.genSaltSync(10)
      const metaphysics = bcrypt.hashSync(userPassword, salt)
      const created = await UserServiceCreateUser({
        userName,
        userId: guid(),
        userPassword: metaphysics,
        metaphysics,
        externalToken: ''
      })
      user = { dataValues: created }
    } else {
      user = user.get ? user.get({ plain: true }) : user
      const metaphysics = (user as any).metaphysics ?? (user as any).userPassword
      if (metaphysics && !bcrypt.compareSync(userPassword, metaphysics)) {
        res.status(401).json({ code: -1, message: '密码错误' })
        return
      }
    }
    const userId = (user.dataValues || user).userId
    const secretKey = (user.dataValues || user).secretKey || guid()
    const token = jwt.sign(
      { userId, userName, userLoginTime: Date.now() },
      secretKey,
      { expiresIn: '24h' }
    )
    res.json({
      code: 0,
      result: { token, userName, userId, userLoginTime: Date.now() }
    })
  } catch (e: any) {
    res.status(500).json({ code: -1, message: e?.message || '登录失败' })
  }
}

/** POST /users/outLogin */
export async function outLogin(_req: Request, res: Response) {
  res.json({ code: 0 })
}

/** POST /users/getUerInfo - 需 Header Authorization: token */
export async function getUerInfo(req: Request, res: Response) {
  try {
    const token = req.headers.authorization
    if (!token) {
      res.status(401).json({ code: -1, message: '未登录' })
      return
    }
    const user = await userServiceGetUerInfo({ userName: (req.body || {}).userName })
    if (!user) {
      res.status(401).json({ code: -1, message: '用户不存在' })
      return
    }
    res.json({ code: 0, result: user })
  } catch (e: any) {
    res.status(500).json({ code: -1, message: e?.message || '获取失败' })
  }
}
