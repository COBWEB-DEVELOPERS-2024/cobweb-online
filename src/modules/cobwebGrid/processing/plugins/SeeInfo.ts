export class SeeInfo {
    private dist: number;
    private type: number;
    private max: number;

    constructor(dist: number, type: number = 0, max: number = 4) {
        this.dist = dist;
        this.type = type;
        this.max = max;
    }

    getDist(): number {
        return this.dist;
    }

    getType(): number {
        return this.type;
    }

    getMax(): number {
        return this.max;
    }
}
