import { Updatable } from './Updatable.js';

export class Drop extends Updatable {
    canStep(agent) {
        throw new Error('canStep must be implemented');
    }

    onStep(agent) {
        throw new Error('onStep must be implemented');
    }

    prepareRemove() {
        throw new Error('prepareRemove must be implemented');
    }
}
