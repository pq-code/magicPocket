export const invalidPasswordError = {
  error: '10001',
  message: '密码不正确',
  result: ''
}

export const userNotExist = {
  error: '10002',
  message: '本地用户不存在',
  result: ''
}

export const tokenExpiredError = {
  error: '10101',
  message: 'token已经过期',
  result: '',
}

export const invalidToken = {
  error: '10102',
  message: '无效token',
  result: '',
}

export const hasNotAdminPermission = {
  error: '10103',
  message: '没有权限',
  result: '',
}

export const notLoggedIn = {
  error: '10104',
  message: '用户信息与token不一致',
  result: '',
}
