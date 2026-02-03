import { Sequelize } from 'sequelize'
import log from '../config/log/log'

const path = require('path')

let documentsPath: string

if (process.env['ELECTRON_RENDERER_URL']) {
  // 打包后运行：使用 out 下的 sqlite 路径
  documentsPath = './out/config/sqlite/magicPocket.db'
} else {
  // 开发环境：放到用户文档目录
  const userHome = process.env.USERPROFILE || process.env.HOME || ''
  documentsPath = path.join(userHome, 'Documents', 'magicPocket', 'sqlite', 'magicPocket.db')
}

console.log('documentsPath-------------****-----------', documentsPath)

// SQLite 不支持自定义 timezone，不要传 timezone 参数
export const seq = new Sequelize({
  dialect: 'sqlite',
  storage: documentsPath,
  logging: false
})

seq
  .authenticate()
  .then(() => {
    log.info('数据库连接成功')
  })
  .catch((err) => {
    log.error('数据库连接失败' + err)
  })
