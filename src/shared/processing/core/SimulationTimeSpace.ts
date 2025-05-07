import { RandomSource } from './RandomSource';

export abstract class SimulationTimeSpace extends RandomSource {
    abstract getTime(): number;
    abstract getTopology(): any;
}
