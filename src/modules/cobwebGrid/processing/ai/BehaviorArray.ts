import {BitField} from "../utils/BitField.ts";
import {Random} from "../utils/Random.ts";

export class BehaviorArray {
    inputSize: number;
    outputSize: number[];
    outputBits: number;
    totalOutMask: number;
    totalInMask: number;
    size: number;
    totalBits: number;
    totalInts: number;
    array: number[];

    constructor(inputBits: number, outputSizes: number[]) {
        this.inputSize = inputBits;
        this.outputSize = outputSizes;
        this.outputBits = outputSizes.reduce((a, b) => a + b, 0);

        if (this.inputSize > 32) throw new Error("inputSize exceeded 32");
        if (this.outputBits > 32) throw new Error("outputBits exceeded 32");

        this.totalOutMask = (1 << this.outputBits) - 1;
        this.totalInMask = (1 << this.inputSize) - 1;
        this.size = (1 << this.inputSize);
        this.totalBits = this.outputBits * this.size;
        this.totalInts = (this.totalBits >> 5) + 1;

        if (this.totalInts === 1) this.totalInts = 2;

        this.array = new Array(this.totalInts).fill(0);
    }

    static copyFrom(original: BehaviorArray): BehaviorArray {
        const newBA = new BehaviorArray(original.inputSize, original.outputSize);
        newBA.array = [...original.array];
        return newBA;
    }

    get(index: number): number {
        const bitbase = index * this.outputBits;
        const base = Math.floor(bitbase / 32);
        const basemod = bitbase % 32;
        const buff = (this.array[base] >>> 0) | ((this.array[base + 1] << 32) >>> 0);
        return (buff >>> basemod) & this.totalOutMask;
    }

    set(index: number, value: number): void {
        const bitbase = index * this.outputBits;
        const base = Math.floor(bitbase / 32);
        const basemod = bitbase % 32;
        value &= this.totalOutMask;

        let buff = (this.array[base] >>> 0) | ((this.array[base + 1] << 32) >>> 0);
        buff &= ~(this.totalOutMask << basemod);
        buff |= (value << basemod);

        this.array[base] = buff & 0xFFFFFFFF;
        this.array[base + 1] = (buff >>> 32) & 0xFFFFFFFF;
    }

    randomInit(seed: number): void {
        const rng = new Random(seed);
        for (let i = 0; i < this.totalInts; i++) {
            this.array[i] = rng.nextInt();
        }
    }

    mutateOutput(index: number, strength: number, rng: Random): void {
        let value = this.get(index);
        for (let i = 0; i < this.outputBits; i++) {
            if (rng.nextFloat() < strength) {
                value ^= (1 << i);
            }
        }
        this.set(index, value);
    }

    getOutput(input: number): number[] {
        input &= this.totalInMask;
        const bits = this.get(input);
        const out: number[] = [];
        let shift = 0;
        for (const size of this.outputSize) {
            out.push((bits >> shift) & ((1 << size) - 1));
            shift += size;
        }
        return out;
    }

    similarity(other: BehaviorArray): number {
        let total = 0;
        const cmpSize = Math.min(this.size, other.size);

        for (let i = 0; i < cmpSize; i++) {
            const out1 = new BitField(this.get(i));
            const out2 = new BitField(other.get(i));

            for (let j = 0; j < this.outputSize.length; j++) {
                if (out1.remove(this.outputSize[j]) === out2.remove(this.outputSize[j])) {
                    total += this.outputSize[j];
                }
            }
        }

        return total / (this.size * this.outputBits);
    }

    static splice(parent1: BehaviorArray, parent2: BehaviorArray, rng: Random): BehaviorArray {
        const child = BehaviorArray.copyFrom(parent1);
        for (let i = 0; i < parent1.size; i++) {
            if (rng.nextBoolean()) {
                child.set(i, parent2.get(i));
            }
        }
        return child;
    }

    copy(mutationRate: number, rng: Random): BehaviorArray {
        const clone = BehaviorArray.copyFrom(this);
        const avgFlips = clone.totalBits * mutationRate;
        const wantFlips = Math.max(0, Math.round(rng.gaussian(0.1) * avgFlips + avgFlips));

        for (let i = 0; i < wantFlips; i++) {
            const target = rng.nextInt(clone.totalBits);
            const targetElement = Math.floor(target / 32);
            const targetBit = target % 32;
            clone.array[targetElement] ^= (1 << targetBit);
        }
        return clone;
    }
}
