class Message {
    constructor(socket, messageID, code, data, onReply) {
        this.socket = socket;
        this.messageID = messageID;
        this.code = code;
        this.data = data;
        this.onReply = onReply;
    }
    toJSON() {
        return {
            messageID: this.messageID,
            code: this.code,
            data: this.data
        };
    }
    toString() {
        try {
            return JSON.stringify(this.toJSON());
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static fromString(data) {
        let message;
        try {
            if (typeof data === 'object' && data !== null) {
                message = new Message(undefined, data.messageID, data.code, data.data, undefined);
            } else if (typeof data === 'string') {
                const obj = JSON.parse(data);
                if (obj) {
                    message = new Message(undefined, obj.messageID, obj.code, obj.data, undefined);
                }
            } else {
                console.warn("Invalid data type provided");
            }
        } catch (err) {
            console.error(err);
        }
        return message;
    }
    send() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.log("WebSocket is not open.");
            return;
        }
        this.socket.send(this.toString());

        if (this.onReply) {
            const handleReply = (data) => {
                const message = Message.fromString(data);
                if (message && message.messageID === this.messageID) {
                    this.onReply(data);
                    this.socket.emitter.off('*', handleReply);
                }
            };
            this.socket.emitter.on('*', handleReply);
        }
    }
}
export default Message;