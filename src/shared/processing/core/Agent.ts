import { LocationDirection } from './LocationDirection.ts';
import { Updatable } from './Updatable.ts';

export abstract class Agent extends Updatable {
    alive: boolean = true;
    energy: number = 0;
    id: number = 0;
    position: LocationDirection | null = null;
    type: number;

    constructor(type: number) {
        super();
        this.type = type;
    }

    abstract takeAPoop(location: LocationDirection): void;

    die(): void {
        if (!this.isAlive()) return;
        this.alive = false;
    }

    getEnergy(): number {
        return this.energy;
    }

    enoughEnergy(required: number): boolean {
        return this.getEnergy() >= required;
    }

    changeEnergy(delta: number): void {
        this.energy += delta;
    }

    getPosition(): LocationDirection | null {
        return this.position;
    }

    isAlive(): boolean {
        return this.alive;
    }

    getType(): number {
        return this.type;
    }

    abstract createChildAsexual(location: LocationDirection): Agent | undefined;

    update(): void {
        // optional override
    }
}
