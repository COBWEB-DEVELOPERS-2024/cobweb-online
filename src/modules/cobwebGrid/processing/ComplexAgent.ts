import { Agent } from "../../../shared/processing/core/Agent.ts";
import { CircularFifoQueue } from "./plugins/broadcast/CircularFifoQueue.ts";
import { ComplexAgentParams } from "./ComplexAgentParams.ts";
import { LocationDirection } from "../../../shared/processing/core/LocationDirection.ts";
import { Environment } from "../../../shared/processing/core/Environment.ts";

export class ComplexAgent extends Agent {
    simulation: any;
    birthTick: number;
    commInbox = 0;
    commOutbox = 0;
    memoryBuffer = 0;
    pregPeriod = 0;
    pregnant = false;
    breedPartner: ComplexAgent | null = null;
    badAgentMemory: CircularFifoQueue<any> | null = null;
    environment!: Environment;
    controller: any;
    params!: ComplexAgentParams;

    constructor(simulation: any, type: number) {
        super(type);
        this.simulation = simulation;
        this.birthTick = simulation?.getTime?.() ?? 0;
    }

    init(environment: Environment, pos: LocationDirection, params: ComplexAgentParams, energy: number): void {
        this.environment = environment;
        this.params = params.clone();
        this.badAgentMemory = new CircularFifoQueue(params.pdMemory);
        this.initPosition(pos);
        this.changeEnergy(energy);
        this.simulation.addAgent(this);
    }

    initPosition(pos: LocationDirection): void {
        if (pos.direction.x === -1 && pos.direction.y === -1) {
            pos.direction = this.simulation.getTopology().getRandomDirection();
        }
        this.move(pos);
    }
    calculateSimilarity(other: ComplexAgent): number {
        // Example: compare type as similarity (0 = different, 1 = same)
        return this.getType() === other.getType() ? 1 : 0;
    }

    move(newPos: LocationDirection | null): void {
        const oldPos = this.position;
        if (oldPos && newPos) {
            newPos = this.simulation.getAgentListener().onTryStep(this, oldPos, newPos);
        }

        if (oldPos) this.environment.setAgent(oldPos, null);
        if (newPos) this.environment.setAgent(newPos, this);

        this.simulation.getAgentListener().onStep(this, oldPos, newPos);
        this.position = newPos;
    }

    update(): void {
        if (!this.isAlive()) return;

        if (this.params.agingMode && this.getAge() >= this.params.agingLimit) {
            this.die();
            return;
        }


        if (!this.simulation.getAgentListener().onNextMove(this)) {
            this.controller.controlAgent(this, this.simulation.getAgentListener());
        }

        this.clearCommInbox();
    }

    step(): void {
        if (!this.environment || !this.environment.topology || !this.position) return;

        const dest: LocationDirection | null = this.environment.topology.getAdjacent(this.position);

        if (dest && this.canStep(dest)) {
            this.onStepFreeTile(dest);
        } else {
            const adj = this.getAdjacentAgent();
            if (adj) this.onStepAgentBump(adj);
            else this.bumpWall();
        }

        if (dest && this.environment.hasDrop(dest)) {
            const drop = this.environment.getDrop(dest);
            if (drop?.canStep(this)) drop.onStep(this);
            else this.bumpWall();
        }

        if (this.getEnergy() <= 0) this.die();
    }



    bumpWall(): void {
        this.changeEnergy(-this.params.stepRockEnergy);
    }

    getAdjacentAgent(): ComplexAgent | null {
        if (!this.environment?.topology || !this.position) return null;

        const dest: LocationDirection | null = this.environment.topology.getAdjacent(this.position);
        return dest ? this.environment.getAgent(dest) as ComplexAgent : null;
    }

    canStep(dest: LocationDirection | null): boolean {
        return !!(dest &&
            this.environment &&
            !this.environment.hasStone(dest) &&
            (!this.environment.hasDrop(dest) || this.environment.getDrop(dest)?.canStep(this)) &&
            !this.environment.hasAgent(dest));
    }

    onStepFreeTile(dest: LocationDirection): void {
        if (this.environment.hasFood(dest)) {
            if (this.canEat(dest)) this.eat(dest);
        }

        this.move(dest);
        this.changeEnergy(-this.params.stepEnergy);
    }

    onStepAgentBump(other: ComplexAgent): void {
        this.simulation.getAgentListener().onContact(this, other);
        this.changeEnergy(-this.params.stepAgentEnergy);

        if (this.canEatAgent(other)) {
            this.eatAgent(other);
        }
    }



    canBroadcast(): boolean {
        return (
            this.params.broadcastMode &&
            this.getEnergy() >= this.params.broadcastEnergyMin
        );
    }

    canEat(dest: LocationDirection): boolean {
        return this.params.foodweb.canEatFood[this.environment.getFoodType(dest)];
    }

    canEatAgent(other: ComplexAgent): boolean {
        return this.params.foodweb.canEatAgent[other.getType()];
    }

    eat(dest: LocationDirection): void {
        const foodType = this.environment.getFoodType(dest);
        this.environment.removeFood(dest);

        const energy = foodType === this.getType()
            ? this.params.foodEnergy
            : this.params.otherFoodEnergy;

        this.changeEnergy(energy);
        this.simulation.getAgentListener().onConsumeFood(this, foodType);
    }

    eatAgent(other: ComplexAgent): void {
        const gain = other.getEnergy() * this.params.agentFoodEnergy;
        this.changeEnergy(gain);
        this.simulation.getAgentListener().onConsumeAgent(this, other);
        other.die();
    }

    die(): void {
        this.simulation.getAgentListener().onDeath(this);
        this.move(null);
        this.badAgentMemory?.clear();
        this.energy = 0;
        this.alive = false;
    }

    getAge(): number {
        return this.simulation.getTime() - this.birthTick;
    }

    clearCommInbox(): void {
        this.commInbox = 0;
    }

    setController(controller: any): void {
        this.controller = controller;
    }

    setMemoryBuffer(val: number): void {
        this.memoryBuffer = val;
    }

    setCommOutbox(val: number): void {
        this.commOutbox = val;
    }

    setCommInbox(val: number): void {
        this.commInbox = val;
    }

    getEnergy(): number {
        return this.energy;
    }

    createChildAsexual(location: LocationDirection): Agent {
        const child = new ComplexAgent(this.simulation, this.getType());
        child.init(this.environment, location, this.params, this.params.initEnergy);
        return child;
    }

    takeAPoop(location: LocationDirection): number {
        const poopType = this.params.poop;
        if (poopType !== -1) {
            const poop = new ComplexAgent(this.simulation, poopType);
            poop.init(this.environment, location, this.params, this.params.initEnergy);
            return 1;
        }
        return 0;
    }
}
