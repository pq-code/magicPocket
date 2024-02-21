import { Sequelize } from 'sequelize'
import log from '../config/log/log'

const path = require('path')

let documentsPath

if (process.env['ELECTRON_RENDERER_URL']) {
  documentsPath = './out/config/sqlite/magicPocket.db'
} else {
  documentsPath = path.join(process.env.USERPROFILE, 'Documents') + '\\magicPocket\\sqlite\\magicPocket.db'
}

console.log('documentsPath-------------****-----------', documentsPath)

export const seq = new Sequelize({
  dialect: 'sqlite',
  storage: documentsPath,
  timezone: '+08:00'
})

seq
  .authenticate()
  .then(() => {
    log.info('数据库连接成功')
  })
  .catch((err) => {
    log.error('数据库连接失败' + err)
  })
