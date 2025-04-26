export class Location {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    toString() {
        return `(${this.x},${this.y})`;
    }
}
