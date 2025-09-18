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
        console.log("this.onReply = " + this.onReply + " " + this.code);

        if (!this.socket || typeof this.socket.send !== 'function') {
            console.error("Message.send: invalid or missing socket.");
            return;
        }

        const payload = this.toString();
        if (payload == null) {
            console.error("Message.send: refusing to send null/invalid payload.");
            return;
        }

        let handleReply;
        if (this.onReply) {
            let done = false;

            handleReply = (data) => {
                if (done) return;

                const message = Message.fromString(data);
                const candidate = message || (typeof data === 'object' && data !== null ? data : null);

                if (candidate && candidate.messageID === this.messageID) {
                    done = true;
                    try {
                        this.onReply(data);
                    } finally {
                        this.socket.off('*', handleReply);
                        this.socket.off(this.code, handleReply);
                    }
                }
            };

            this.socket.on('*', handleReply);
            this.socket.on(this.code, handleReply);
        }

        this.socket.send(payload);
    }
}

export default Message;
