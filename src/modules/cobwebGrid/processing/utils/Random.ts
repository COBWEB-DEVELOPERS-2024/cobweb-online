export class Random {
    private internal: () => number;

    constructor(seed?: number) {
        if (seed !== undefined) {
            let state = seed;
            this.internal = () => {
                state = (state * 1664525 + 1013904223) % 0x100000000;
                return state / 0x100000000;
            };
        } else {
            this.internal = Math.random;
        }
    }

    /**
     * Returns a float between 0 (inclusive) and 1 (exclusive)
     */
    nextFloat(): number {
        return this.internal();
    }

    /**
     * If no args: returns an unbounded int [0, 2^32)
     * If 1 arg: returns int in range [0, bound)
     */
    nextInt(bound?: number): number {
        const rand = Math.floor(this.internal() * 0x100000000);
        if (bound !== undefined) {
            return rand % bound;
        }
        return rand;
    }

    nextBoolean(): boolean {
        return this.nextFloat() < 0.5;
    }

    nextIntRange(min: number, max: number): number {
        return Math.floor(this.internal() * (max - min)) + min;
    }

    gaussian(stdev = 1): number {
        let u = 0, v = 0;
        while (u === 0) u = this.internal();
        while (v === 0) v = this.internal();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdev;
    }
}
