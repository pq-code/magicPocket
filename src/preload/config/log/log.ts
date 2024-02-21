import logger from 'electron-log'

logger.transports.file.level = 'debug'
logger.transports.file.maxSize = 30 * 1024 * 1024 // 最大不超过10M
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}' // 设置文件内容格式

var dayjs = require('dayjs')
const date = dayjs().format('YYYY-MM-DD') // 格式化日期为 yyyy-mm-dd

logger.transports.file.fileName = date + '.log' // 创建文件名格式为 '时间.log' (2023-02-01.log)

// 可以将文件放置到指定文件夹中，例如放到安装包文件夹中
const path = require('path')
let logsPath

if (process.env['ELECTRON_RENDERER_URL']) {
  logsPath = './out/config/logs/' + date + '.log'
} else {
  logsPath = path.join(process.env.USERPROFILE, 'Documents') + '\\magicPocket\\logs\\' + date + '.log'
}

console.log('logsPath-------------****-----------', logsPath) // 获取到安装目录的文件夹名称

// 指定日志文件夹位置
logger.transports.file.resolvePath = () => logsPath

// 有六个日志级别error, warn, info, verbose, debug, silly。默认是silly
export default {
  info(param) {
    logger.info(param)
  },
  warn(param) {
    logger.warn(param)
  },
  error(param) {
    logger.error(param)
  },
  debug(param) {
    logger.debug(param)
  },
  verbose(param) {
    logger.verbose(param)
  },
  silly(param) {
    logger.silly(param)
  }
}
