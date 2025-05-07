export class Location {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    equals(other: Location): boolean {
        return this.x === other.x && this.y === other.y;
    }

    toString(): string {
        return `(${this.x},${this.y})`;
    }
}
