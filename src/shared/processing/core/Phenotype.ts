export abstract class Phenotype {
    abstract modifyValue(cause: any, agent: any, multiplier: number): void;
    abstract unmodifyValue(cause: any, agent: any): void;
    abstract getName(): string;

    toString(): string {
        return this.getName();
    }
}
