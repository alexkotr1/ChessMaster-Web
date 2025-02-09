class WebSocketEventEmitter {
    constructor(socket) {
        this.socket = socket;
        this.events = {};

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (process.env.NODE_ENV === "development") {
                    console.log("received message! ");
                    console.log(message);
                }
                this.emit(message.code, message);
                this.emit()
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };
        this.socket.onopen = () => this.emit("open");
        this.socket.onclose = (event) => this.emit("close");
        this.socket.onerror = (error) => this.emit("error", error);
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter((cb) => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach((callback) => callback(data));
        }
        if (this.events['*']) {
            this.events['*'].forEach((callback) => callback(data));
        }
    }
}

export default WebSocketEventEmitter;