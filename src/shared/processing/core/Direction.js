export class Direction {
    constructor(x, y) {
        this.x = Math.sign(x);
        this.y = Math.sign(y);
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    toString() {
        return `(${this.x},${this.y})`;
    }
}
