//无敌垫片
class ConnectWebrtc {
    protected connection: RTCPeerConnection | null;
    constructor() {
        this.connection = null;
    }

    //创建RTCPeerConnection实例，同时监听icecandidate，track事件
    create(
        onAddStream: EventListenerOrEventListenerObject,
        onReomveStream: EventListenerOrEventListenerObject,
        onCandidate: (candidate: RTCIceCandidate) => void
    ) {
        this.connection = new RTCPeerConnection(undefined);

        this.connection.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
                onCandidate(event.candidate);
            } else {
                console.log("End of candidates.");
            }
        });
        this.connection.addEventListener("track", onAddStream);
        this.connection.addEventListener("removeTrack", onReomveStream);
    }

    //创建offer sdp
    createOffer(
        onSessionDescription: (
            sessionDescription: RTCSessionDescriptionInit
        ) => void
    ) {
        if (this.connection) {
            this.connection
                .createOffer()
                .then((sessionDescription) => {
                    if (this.connection) {
                        this.connection.setLocalDescription(sessionDescription);
                        onSessionDescription(sessionDescription);
                    }
                })
                .catch(() => {
                    console.log("offer create error");
                });
        }
    }
    
    //创建answer sdp
    createAnswer(
        onSessionDescription: (
            sessionDescription: RTCSessionDescriptionInit
        ) => void
    ) {
        if (this.connection) {
            this.connection
                .createAnswer()
                .then((sessionDescription) => {
                    if (this.connection) {
                        this.connection.setLocalDescription(sessionDescription);
                    }

                    onSessionDescription(sessionDescription);
                })
                .catch(() => {
                    console.log("创建answer失败");
                });
        }
    }

    //设置远端描述
    setRemoteDescription(
        sessionDescription: RTCSessionDescriptionInit | undefined
    ) {
        this.connection?.setRemoteDescription(
            new RTCSessionDescription(sessionDescription)
        );
    }

    //设置候选人
    setCandidate(message: any) {
        if (this.connection) {
            const candidate = new RTCIceCandidate({
                sdpMLineIndex: message.label,
                candidate: message.candidate,
            });
            this.connection.addIceCandidate(candidate).catch((error) => {
                console.log(error);
            });
        }
    }

    //讲媒体流添加到连接中
    addTrack(stream: MediaStream) {
        if (this.connection) {
            this.connection.addTrack(stream.getVideoTracks()[0], stream);
            this.connection.addTrack(stream.getAudioTracks()[0], stream);
        }
    }

    //从连接中删除媒体流
    removeTrack() {
        if (this.connection) {
            this.connection.removeTrack(this.connection.getSenders()[0]);
        }
    }
}

export default ConnectWebrtc;
