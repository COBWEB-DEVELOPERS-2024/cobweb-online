export class CircularFifoQueue {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.queue = [];
    }

    add(item) {
        if (this.queue.length >= this.maxSize) {
            this.queue.shift();
        }
        this.queue.push(item);
    }

    remove(item) {
        this.queue = this.queue.filter(i => i !== item);
    }

    contains(item) {
        return this.queue.includes(item);
    }

    clear() {
        this.queue = [];
    }

    [Symbol.iterator]() {
        return this.queue.values();
    }
}