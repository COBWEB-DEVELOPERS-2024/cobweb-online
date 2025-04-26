import { RandomSource } from './RandomSource.js';

export class SimulationTimeSpace extends RandomSource {
    getTime() {
        throw new Error('getTime must be implemented');
    }

    getTopology() {
        throw new Error('getTopology must be implemented');
    }
}
