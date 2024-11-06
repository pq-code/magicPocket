const fs = require('fs')

const Router = require('koa-router')
const router = new Router()

fs.readdirSync(__dirname).forEach(file => {
  if (file !== 'index.js') {
        console.log('loading------ ' + file)
        let r = require('./' + file)
        router.use(r.routes())
    }
})

module.exports = router
