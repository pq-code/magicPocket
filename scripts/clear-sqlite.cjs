/**
 * 清空 SQLite 所有表
 * 用法：npm run clear-sqlite
 * 可选：DB_PATH=/path/to/db npm run clear-sqlite
 */
const path = require('path')
const { Sequelize } = require('sequelize')

const userHome = process.env.USERPROFILE || process.env.HOME || ''
const defaultPath = path.join(userHome, 'Documents', 'magicPocket', 'sqlite', 'magicPocket.db')
const dbPath = process.env.DB_PATH || defaultPath

console.log('数据库路径:', dbPath)

const seq = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
})

async function clearAllTables() {
  try {
    await seq.authenticate()
    const qi = seq.getQueryInterface()
    const tables = await qi.showAllTables()
    if (tables.length === 0) {
      console.log('当前无表，无需清空')
      return
    }
    console.log('将要删除的表:', tables)
    await qi.dropAllTables()
    console.log('✅ 所有表已清空')
  } catch (err) {
    console.error('❌ 清空失败:', err.message)
    process.exit(1)
  } finally {
    await seq.close()
  }
}

clearAllTables()
