import io from "socket.io-client";

interface usrData {
  user: string;
  value: string;
  id: string;
}

export class SocketUtils {
  private socket: any;
  private userID;
  constructor(userID: string) {
    this.userID = userID;
  }
  // 建立连接
  linkStart() {
    this.socket = io("http://192.168.9.71:4005"); // 连接后端的 socket.io 方法里面传服务端的ip
    this.socket.on("connect", () => {
      console.log(this.socket.id, "监听客户端连接成功-connect");
      console.log(this.userID); // 创建用户Id房间
      this.socket.volatile.timeout(5000).emit("logIn", this.userID);
    });
    return this.socket;
  }
  // 加入房间
  joinRoom(roomId: string) {
    console.log('roomId',roomId)
    this.socket.timeout(5000).emit("joinRoom", roomId);
      // 接收信息
  }

   // 断开连接
  linkEnd() {
    this.socket.on("disconnect", () => {
      console.log(this.socket.id, "监听客户端断开链接-disconnect");
      console.log(this.userID); // 创建用户Id房间
    })
  }

  // 发送消息
  sendMessage(message) {
    this.socket
      .timeout(5000)
      .emit("message",
        {
          userId: message.userId,
          socketId: message.socketId,
          data: message.data,
          target: message.target
        }
      );
  }
   // 处理接收到的消息
    handleMessage(message: usrData) {
    // 在这里处理接收到的消息
    console.log("处理消息:", message);
    // 你可以在这里添加更多的逻辑来处理消息
  }
}
