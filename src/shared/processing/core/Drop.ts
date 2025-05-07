import { Updatable } from './Updatable';

export abstract class Drop extends Updatable {
    abstract canStep(agent: any): boolean;
    abstract onStep(agent: any): void;
    abstract prepareRemove(): void;
}
