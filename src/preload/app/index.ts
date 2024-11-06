const express = require('express');

import { Server } from "socket.io";
import http from "http";

import { getLocalIP } from "../utils/service"
import { NodeSocket } from "../socket/ws/linkStart"

import { httpPort } from "../config/node/config"

import { join } from 'path'

import { is } from '@electron-toolkit/utils'

import {router } from '../router'

let httpHost = httpPort
let app = express();

if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  app.use(express.static(process.env['ELECTRON_RENDERER_URL'])) // 获取页面
} else {
  app.use(express.static(join(__dirname, '../renderer/index.html')))// 获取页面
}

app.use(router.routes()).use(router.allowedMethods())// 判断请求是否支持

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
