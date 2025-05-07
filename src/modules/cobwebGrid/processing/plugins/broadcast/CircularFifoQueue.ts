export class CircularFifoQueue<T> {
    private maxSize: number;
    private queue: T[];

    constructor(maxSize: number) {
        this.maxSize = maxSize;
        this.queue = [];
    }

    add(item: T): void {
        if (this.queue.length >= this.maxSize) {
            this.queue.shift();
        }
        this.queue.push(item);
    }

    remove(item: T): void {
        this.queue = this.queue.filter(i => i !== item);
    }

    contains(item: T): boolean {
        return this.queue.includes(item);
    }

    clear(): void {
        this.queue = [];
    }

    [Symbol.iterator](): Iterator<T> {
        return this.queue.values();
    }
}
