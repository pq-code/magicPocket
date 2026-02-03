import express from 'express'

import { Server } from "socket.io";
import http from "http";

import { getLocalIP } from "../utils/service"
import { NodeSocket } from "../socket/ws/linkStart"

import { httpPort } from "../config/node/config"

import { join } from 'path'

import { is } from '@electron-toolkit/utils'

import materialRouter from '../router/material'
import usersRouter from '../router/users'
import lowCodeRouter from '../router/lowCode.express'
import '../model/material.model'
import '../model/lowCodeConfig.model'
import { materialSeed } from '../service/material.service'

let httpHost = httpPort
let app = express()

app.use(express.json())

if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  app.use(express.static(process.env['ELECTRON_RENDERER_URL']))
} else {
  app.use(express.static(join(__dirname, '../renderer/index.html')))
}

// 代理会把 /api 重写掉，所以后端收到的是 /users/xxx、/lowCode/xxx、/materials
app.use('/users', usersRouter)
app.use('/lowCode', lowCodeRouter)
app.use('/', materialRouter)

// 开启http
export const linkStartHttp = () => {
  const server = http.createServer(app);
  const { locatIpIpv4, locatIpIpv6 } = getLocalIP()

  // 开启ws
  const io = new Server(server, {
    serveClient: true,
    cors: {
      origin: '*', // from the screenshot you provided
      // methods: ['GET', 'POST'],
    },
  });

  const nodeSocket = new NodeSocket(io)
  nodeSocket.linkStart() // 开启ws服务

  // 启动服务器监听端口
  server.listen(httpHost, () => {
    console.log(`----------Http启动成功--------
      App running at:
         - Local: http://localhost:${httpHost}
         - Network:  http://${locatIpIpv4}:${httpHost}
         ${locatIpIpv6[0] ? '- ipdv6Network: http://[' + (locatIpIpv6[0] as any)?.address || '没有ipv6' + ' }]:' + httpHost : ''}
      `);
    materialSeed('system', 'system')
      .then((r: { inserted: number; total: number }) => {
        if (r.inserted > 0) console.log(`[物料] 默认物料已填入: ${r.inserted}/${r.total}`)
      })
      .catch((e: Error) => console.warn('[物料] seed 失败', e?.message))
  });

  //设置出错时的回调函数
  server.on('error', function (err: any) {
    if (err.code === 'EADDRINUSE') {
      console.log('地址正被使用，重试中...')
      httpHost++
      setTimeout(() => {
        server.close()
        server.listen(httpHost)
      }, 1000)
    } else {
      console.error('服务器异常：', err)
    }
  })
}
