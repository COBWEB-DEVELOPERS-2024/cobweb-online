export class BitField {
    private value: number;

    constructor(v: number = 0) {
        this.value = v;
    }

    /**
     * Adds `val` to the bitfield using the given number of bits.
     * Left-shifts current value to make space, then ORs in the new value.
     */
    add(val: number, bits: number): void {
        val &= (1 << bits) - 1;
        this.value = (this.value << bits) | val;
    }

    /**
     * Returns the stored integer value.
     */
    intValue(): number {
        return this.value;
    }

    /**
     * Removes `bits` number of bits and returns the lower bits.
     */
    remove(bits: number): number {
        const ret = this.value & ((1 << bits) - 1);
        this.value >>>= bits;
        return ret;
    }
}
