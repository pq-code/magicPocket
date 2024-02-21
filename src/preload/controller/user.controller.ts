const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

import log from '../config/log/log'
import { invalidPasswordError, userNotExist } from '../constants/err.type'

import { UserServiceCreateUser, userServiceGetUerInfo, userServiceUpdateById } from '../service/user.service'

import { guid } from '../utils/index'

export const login = async (ctx) => {
  let userId, secretKey, userInfiorm, metaphysics
  let { userName, userPassword, externalToken, locally } = ctx.params
  log.info(`登录请求---------- ${userName}`)

  try {
    // 密码加密
    const salt = bcrypt.genSaltSync(10) // 创建盐
    metaphysics = bcrypt.hashSync(userPassword, salt) // 密码加盐
    userPassword = bcrypt.hashSync('adsSAD21.;JH31P;"134', salt) // 密码加盐
  } catch (err) {
    log.error(`密码加密失败${err}`)
  }

  try {
    // 获取账号信息
    userInfiorm = await userServiceGetUerInfo({ userName })
    log.info(`查询本地用户成功${JSON.stringify(userInfiorm)}`)

    if (locally && !bcrypt.compareSync(metaphysics, userInfiorm.metaphysics)) {
      return (ctx.body = invalidPasswordError)
    }
    // 本地用户登录密码正确，或者非本地用户登录
    userId = userInfiorm.userId
    secretKey = userInfiorm.secretKey

  } catch (err) {
    // 本地登录不允许新建用户
    if (locally) {
      return (ctx.body = userNotExist)
    }
    log.info(`本地用户不存在，第三方系统登陆成功，自动注册本地用户---------- ${err}`)
    // 创建用户信息
    userId = guid()
    const loginRes = await UserServiceCreateUser({ userName, userId, userPassword, metaphysics, externalToken })
    userId = loginRes.userId
    secretKey = loginRes.secretKey
  }

  try {
    // 异步记录登录时间，不阻塞登录
    let userLoginTime = Date.now()
    userServiceUpdateById({ userId, userLoginTime, externalToken }).then((res) => {
      log.info(`用户登录时间记录成功-- ${res}`)
    })

    // 创建全局变量提供给token验证
    global.secretKey = secretKey

    return {
      code: 200,
      msg: '登录成功',
      result: {
        userName,
        userId,
        userLoginTime,
        token: jwt.sign(
          {
            userId,
            userName,
            userLoginTime
          },
          secretKey,
          { expiresIn: '24h' }
        )
      }
    }
  } catch (err) {
    return (ctx.body = err)
  }
}

export const logOut = async (ctx) => {
  let { userName, userId } = ctx.params
  let secretKey = guid()
  try {
    log.info(`注销登录请求----------`)
    await userServiceUpdateById({ userId, secretKey })
    log.info(`注销成功---------- `)
    return {
      code: 200,
      msg: '注销成功',
      result: {
        userName,
        userId
      }
    }
  } catch (err) {
    return (ctx.body = err)
  }
}
