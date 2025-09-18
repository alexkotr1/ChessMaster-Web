class Socket extends WebSocket {
    constructor(socketUrl, maxRetries = 5, retryDelay = 1000) {
        super(socketUrl);
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
        this.retries = 0;
        this.events = {};
        this.setupListeners();
    }

    setupListeners() {
        this.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (process.env.NODE_ENV === "development") {
                    console.log("Received message:", message);
                }
                this.emit(message.code, message);
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        this.onopen = () => {
            console.log("WebSocket connected!");
            this.emit("open");
            this.retries = 0;
        };

        this.onclose = (event) => {
            console.warn(`WebSocket closed, retrying in ${this.retryDelay}ms...`);
            this.emit("close");
            this.reconnect();
        };

        this.onerror = (error) => {
            console.error("WebSocket error:", error);
            this.emit("error", error);
            this.close();
        };
    }

    reconnect() {
        if (this.retries < this.maxRetries) {
            this.retries++;
            setTimeout(() => {
                console.log(`Reconnecting... Attempt ${this.retries}/${this.maxRetries}`);
                new Socket(this.url, this.maxRetries, this.retryDelay);
            }, this.retryDelay * this.retries);
        } else {
            console.error("Max reconnect attempts reached.");
        }
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

        if (event !== "*" && this.events["*"]) {
            this.events["*"].forEach((callback) => callback(data));
        }
    }
}

export default Socket;
