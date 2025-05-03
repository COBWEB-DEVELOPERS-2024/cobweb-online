export class Direction {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = Math.sign(x);
        this.y = Math.sign(y);
    }

    equals(other: Direction): boolean {
        return this.x === other.x && this.y === other.y;
    }

    toString(): string {
        return `(${this.x},${this.y})`;
    }
}
