import { gpUser } from '../model/user.model'
import { guid } from '../utils/index'

interface userType {
  userName?: string
  metaphysics?: string
  userPassword?: string
  externalToken?: string
  userSource?: string
  userSourceId?: string
  userEmail?: string
  isAdmins?: boolean
  userNickname?: string
  userLoginTime?: number
  userProfilePhoto?: string
  userId?: string
  userInfo?: string
  secretKey?: string
}

// 创建用户信息
export const UserServiceCreateUser = async ({
  userName,
  metaphysics,
  userPassword,
  externalToken,
  userSource,
  userSourceId,
  userEmail,
  isAdmins,
  userNickname,
  userProfilePhoto,
  userId,
  userInfo,
  secretKey,
}: userType) => {
  // 写入数据库
  secretKey = secretKey ? secretKey : guid()
  userId = userId ? userId : guid()
  isAdmins = isAdmins ? isAdmins : false
  const res = await gpUser.create({
    secretKey,
    userName,
    metaphysics,
    userPassword,
    externalToken,
    userSource,
    userSourceId,
    userEmail,
    isAdmins,
    userNickname,
    userProfilePhoto,
    userId,
    userInfo
  })
  return res.dataValues
}
// 获取用户信息
export const userServiceGetUerInfo = async ({
  userId,
  externalToken,
  userSource,
  userSourceId,
  userName,
  userEmail,
  isAdmins,
  userNickname,
  userProfilePhoto,
  secretKey
}: userType) => {
  const whereOpt = {}
  userId && Object.assign(whereOpt, { userId }) // 当id存在的时候拷贝到whereOpt里面
  userSourceId && Object.assign(whereOpt, { userSourceId })
  userSource && Object.assign(whereOpt, { userSource })
  userName && Object.assign(whereOpt, { userName })
  userEmail && Object.assign(whereOpt, { userEmail })
  isAdmins && Object.assign(whereOpt, { isAdmins })
  userProfilePhoto && Object.assign(whereOpt, { userProfilePhoto })
  userNickname && Object.assign(whereOpt, { userNickname })
  secretKey && Object.assign(whereOpt, { secretKey })
  externalToken && Object.assign(whereOpt, { externalToken })

  const res = await gpUser.findOne({
    attributes: [
      'userId',
      'userInfo',
      'userSourceId',
      'userSource',
      'userName',
      'isAdmins',
      'userEmail',
      'userProfilePhoto',
      'userNickname',
      'secretKey',
      'externalToken'
    ],
    where: whereOpt
  })
  return res ? res.dataValues : null
}
// 更新用户信息
export const userServiceUpdateById = async ({
  userId,
  userName,
  userPassword,
  externalToken,
  userEmail,
  userLoginTime,
  isAdmins,
  userNickname,
  userProfilePhoto,
  userInfo,
  secretKey
}: userType) => {
  const whereOpt = { userId }
  const newUser = {}
  secretKey && Object.assign(newUser, { secretKey })
  userName && Object.assign(newUser, { userName })
  userPassword && Object.assign(newUser, { userPassword })
  externalToken && Object.assign(newUser, { externalToken })
  isAdmins && Object.assign(newUser, { isAdmins })
  userEmail && Object.assign(newUser, { userEmail })
  userNickname && Object.assign(newUser, { userNickname })
  userLoginTime && Object.assign(newUser, { userLoginTime })
  userProfilePhoto && Object.assign(whereOpt, { userProfilePhoto })
  userInfo && Object.assign(whereOpt, { userInfo })
  const res = await gpUser.update(newUser, { where: whereOpt })
  return res[0] > 0 ? true : false
}
