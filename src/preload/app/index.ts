const { Server } = require('socket.io');
import NodeSocket from '../socket/ws/linkStart'
const http = require('http');

const server = http.createServer((res, req) => {
  // 设置响应头部信息
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  // 发送响应数据
  res.end('Hello World!');
});


const io = new Server(server, {
  serveClient: false,
  cors: {
    origin: '*', // from the screenshot you provided
    methods: ['GET', 'POST'],
  },
});


const nodeSocket = new NodeSocket(io)
nodeSocket.linkStart() // 开启ws服务
