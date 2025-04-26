export class Phenotype {
    modifyValue(cause, agent, multiplier) {
        throw new Error('modifyValue must be implemented');
    }

    unmodifyValue(cause, agent) {
        throw new Error('unmodifyValue must be implemented');
    }

    getName() {
        throw new Error('getName must be implemented');
    }

    toString() {
        return this.getName();
    }
}
