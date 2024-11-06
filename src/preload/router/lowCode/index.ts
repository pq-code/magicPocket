const KoaRouter = require('koa-router');

const { userValidator,
    verifyUser,
    verifyLogin,
    cryptPassword } = require('../middleware/user.middleware')

const { auth } = require('../middleware/auth.middleware')

const { register, login, outLogin, changePassword, loginGetUerInfo } = require('../controller/user.controller')


const userRouter = new KoaRouter({ prefix: '/users' });

//  注册接口
userRouter.post('/register', userValidator, verifyUser, cryptPassword, register)

//  登录接口
userRouter.post('/login', userValidator, verifyLogin, login)

// 退出登录
userRouter.post('/outLogin', userValidator, verifyLogin, outLogin)

//  获取登陆信息接口
userRouter.post('/getUerInfo', auth, loginGetUerInfo)

//  修改密码接口
userRouter.patch('/passwords', auth, cryptPassword, changePassword)

module.exports = userRouter
