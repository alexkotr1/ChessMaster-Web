class Timer {
    static DURATION_INFINITY = -1;

    constructor(interval = 1000, duration = Timer.DURATION_INFINITY, onTick) {
        this.interval = interval;
        this.duration = duration;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.timerId = null;
        this.onTick = onTick;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.timerId = setInterval(() => {
            this.onTick();
            this.elapsedTime += this.interval;
            if (this.duration > 0 && this.elapsedTime >= this.duration) {
                this.setRemainingTime(0);
                this.pause();
            }
        }, this.interval);
    }

    pause() {
        if (!this.isRunning) return;
        clearInterval(this.timerId);
        this.isRunning = false;
        console.log("Pausing timer");
    }

    cancel() {
        this.pause();
        this.elapsedTime = 0;
    }

    getElapsedTime() {
        return this.elapsedTime;
    }

    getRemainingTime() {
        return this.duration === Timer.DURATION_INFINITY ? Timer.DURATION_INFINITY : this.duration - this.elapsedTime;
    }

    setRemainingTime(duration) {
        let wasRunning = this.isRunning;
        this.pause();
        this.duration = duration;
        this.elapsedTime = 0;
        if (wasRunning) this.start();
    }
}

export default Timer;