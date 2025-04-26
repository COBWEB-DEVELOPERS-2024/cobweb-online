import { Phenotype } from './Phenotype.js';

export class NullPhenotype extends Phenotype {
    modifyValue(cause, agent, multiplier) {
        // Do nothing
    }

    unmodifyValue(cause, agent) {
        // Do nothing
    }

    getIdentifier() {
        return "None";
    }

    getName() {
        return "[Null]";
    }
}
