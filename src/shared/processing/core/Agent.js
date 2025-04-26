import { LocationDirection } from './LocationDirection.js';
import { Cause } from './Cause.js';
import { Updatable } from './Updatable.js';

export class Agent extends Updatable {
    alive = true;
    energy = 0;
    id = 0;
    position = null;

    constructor(type) {
        super();
        this.type = type;
    }

    takeAPoop(location) {
        throw new Error('takeAPoop must be implemented by subclasses');
    }

    die() {
        if (!this.isAlive()) return;
        this.alive = false;
    }

    getEnergy() {
        return this.energy;
    }

    enoughEnergy(required) {
        return this.getEnergy() >= required;
    }

    changeEnergy(delta, cause) {
        this.energy += delta;
    }

    getPosition() {
        return this.position;
    }

    isAlive() {
        return this.alive;
    }

    getType() {
        return this.type;
    }

    createChildAsexual(location) {
        throw new Error('createChildAsexual must be implemented by subclasses');
    }

    update() {
        // No-op in base agent
    }
}
