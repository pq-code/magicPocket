const http = require('http');
const url = require('url');
const fs = require('fs');

const querystring = require('querystring');
import { getLocalIP } from "../../utils/service"
import { NodeSocket } from "../ws/linkStart"

const { Server } = require('socket.io');

let httpHost = 3000

const server = http.createServer((req, res) => {
  // 解析 URL
  const parsedUrl = url.parse(req.url, true);

  // 获取路径和查询参数
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  console.log(path, query, req.method)
  if (path === '/') {
    fs.readFile('../../../renderer/index.html', (err, data) => {
      if (err) {
        console.log('获取文件失败')
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      console.log('获取文件成功')
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
  // // 处理不同类型的请求
  // if (req.method === 'GET' && path === '/hello') {
  //   handleHelloRequest(query, res);
  // } else if (req.method === 'POST' && path === '/submit') {
  //   handlePostRequest(req, res);
  // } else {
  //   // 处理未知路径和方法的请求
  //   res.writeHead(404, { 'Content-Type': 'text/plain' });
  //   res.end('Not Found');
  // }
});

// 处理 GET 请求
function handleHelloRequest(query, res) {
  const name = query.name || 'Guest';
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Hello, ${name}!\n`);
}

// 处理 POST 请求
function handlePostRequest(req, res) {
  let data = '';

  req.on('data', (chunk) => {
    // 接收 POST 数据
    data += chunk;
  });

  req.on('end', () => {
    // 解析 POST 数据
    const postData = querystring.parse(data);

    // 生成适当的响应
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Received POST data: ${JSON.stringify(postData)}\n`);
  });
}



export const linkStartHttp = () => {
  const { locatIpIpv4, locatIpIpv6 } = getLocalIP()
  // 启动服务器监听端口
  server.listen(httpHost, () => {
    console.log(`----------Http启动成功--------
      App running at:
         - Local: http://localhost:${httpHost}
         - Network:  http://${locatIpIpv4}:${httpHost}
         - ipdv6Network: http://[${locatIpIpv6[0]?.address || '没有ipv6'}]:${httpHost}
         `);
  });

  //设置出错时的回调函数
  server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
      console.log('地址正被使用，重试中...')
      httpHost++
      setTimeout(() => {
        server.close()
        server.listen(httpHost, '127.0.0.1')
      }, 1000)
    } else {
      console.error('服务器异常：', err)
    }
  })

  // 开启ws
  const io = new Server(server, {
    serveClient: false,
    cors: {
      origin: '*', // from the screenshot you provided
      methods: ['GET', 'POST'],
    },
  });

  const nodeSocket = new NodeSocket(io)
  nodeSocket.linkStart() // 开启ws服务
}




