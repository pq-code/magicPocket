class NodeSocket {
    constructor(io) {
        this.io = io
        this.chatList = []
        this.userId = ''
    }
    linkStart() {
        this.io.on('connection', (socket) => {
            console.log(`客户端建立连接成功${socket.id}`)
            socket.emit('broadcast', { NumberOnline: this.io.engine.clientsCount })
            socket.broadcast.emit('broadcast', { NumberOnline: this.io.engine.clientsCount });
            socket.on('logIn', (userId) => {
                this.userId = userId
                socket.join(`${userId}`); // 加入自身id的房间号
            })
            socket.on('send-message', (user, message, id) => {
                socket.to(`${id}`).emit("fresh-message", {
                    id: this.userId, chatList: {
                        user,
                        message,
                        createTime: new Date(),
                        id
                    }
                });
            });
            socket.on("disconnecting", () => {
                console.log(socket.rooms); // id , 房间号
            });
            socket.on("disconnect", (reason) => {
                switch (reason) {
                    case 'io server disconnect':
                        console.log(`'服务器已使用socket.disconnect()强制断开socket'${reason}`); // the Set contains at least the socket ID
                        break;
                    case 'io client disconnect':
                        console.log(`'使用socket.disconnect()手动断开socket'${reason}`); // the Set contains at least the socket ID
                        break;
                    case 'ping timeout':
                        console.log(`'服务器未在该pingInterval + pingTimeout范围内发送 PING'${reason}`); // the Set contains at least the socket ID
                        break;
                    case 'transport close':
                        console.log(`'连接已关闭（例如：用户失去连接，或网络从 WiFi 更改为 4G）'${reason}`); // the Set contains at least the socket ID
                        break;
                    case 'transport error':
                        console.log(`'连接遇到错误（例如：服务器在 HTTP 长轮询周期中被杀死）'${reason}`); // the Set contains at least the socket ID
                        break;
                }
            });
            this.io.engine.on("connection_error", (err) => {
                console.log(err.req);      // the request object
                console.log(err.code);     // the error code, for example 1
                console.log(err.message);  // the error message, for example "Session ID unknown"
                console.log(err.context);  // some additional error context
            });

        });
    }
}



module.exports = NodeSocket
