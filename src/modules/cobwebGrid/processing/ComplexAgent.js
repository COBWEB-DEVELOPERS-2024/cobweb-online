import { Agent } from "../../../shared/processing/core/Agent.js";
import { LocationDirection } from "../../../shared/processing/core/Location.js";
import { PacketConduit } from "./plugins/broadcast/PacketConduit.js";
import { FoodBroadcast } from "./plugins/broadcast/FoodBroadcast.js";
import { CircularFifoQueue } from "./plugins/broadcast/CircularFifoQueue.js";


export class ComplexAgent extends Agent {
    constructor(simulation, type) {
        super(type);
        this.simulation = simulation;
        this.birthTick = simulation.getTime();

        this.commInbox = 0;
        this.commOutbox = 0;
        this.memoryBuffer = 0;

        this.pregPeriod = 0;
        this.pregnant = false;
        this.breedPartner = null;
        this.badAgentMemory = null;
        this.environment = null;
        this.controller = null;
    }

    init(environment, pos, params, energy) {
        this.environment = environment;
        this.params = params.clone();
        this.badAgentMemory = new CircularFifoQueue(params.pdMemory);
        this.initPosition(pos);
        this.changeEnergy(energy, { getName: () => "Creation" });
        this.simulation.addAgent(this);
    }

    initPosition(pos) {
        if (pos.direction === "NONE") {
            pos.direction = this.simulation.getTopology().getRandomDirection();
        }
        this.move(pos);
    }

    move(newPos) {
        const oldPos = this.position;
        if (oldPos && newPos)
            newPos = this.simulation.getAgentListener().onTryStep(this, oldPos, newPos);

        if (oldPos) this.environment.setAgent(oldPos, null);
        if (newPos) this.environment.setAgent(newPos, this);

        this.simulation.getAgentListener().onStep(this, oldPos, newPos);
        this.position = newPos;
    }

    update() {
        if (!this.isAlive()) return;

        if (this.params.agingMode && this.getAge() >= this.params.agingLimit.getValue()) {
            this.die();
            return;
        }

        if (this.params.broadcastMode)
            this.receiveBroadcast();

        if (!this.simulation.getAgentListener().onNextMove(this)) {
            this.controller.controlAgent(this, this.simulation.getAgentListener());
        }

        this.clearCommInbox();
    }

    step() {
        const dest = this.environment.topology.getAdjacent(this.position);

        if (this.canStep(dest)) {
            this.onStepFreeTile(dest);
        } else {
            const adj = this.getAdjacentAgent();
            if (adj) this.onStepAgentBump(adj);
            else this.bumpWall();
        }

        if (this.environment.hasDrop(dest)) {
            const drop = this.environment.getDrop(dest);
            if (drop.canStep(this))
                drop.onStep(this);
            else
                this.bumpWall();
        }

        if (this.getEnergy() <= 0) this.die();
    }

    bumpWall() {
        this.changeEnergy(-this.params.stepRockEnergy.getValue(), { getName: () => "Bump Wall" });
    }

    getAdjacentAgent() {
        const dest = this.environment.topology.getAdjacent(this.position);
        return dest ? this.environment.getAgent(dest) : null;
    }

    canStep(dest) {
        return dest && !this.environment.hasStone(dest) && (!this.environment.hasDrop(dest) || this.environment.getDrop(dest).canStep(this)) && !this.environment.hasAgent(dest);
    }

    onStepFreeTile(dest) {
        if (this.environment.hasFood(dest)) {
            if (this.canBroadcast()) {
                this.broadcast(new FoodBroadcast(dest, this), { getName: () => "Broadcast Food" });
            }
            if (this.canEat(dest)) this.eat(dest);
        }

        this.move(dest);
        this.changeEnergy(-this.params.stepEnergy.getValue(), { getName: () => "Step Forward" });
    }

    onStepAgentBump(other) {
        this.simulation.getAgentListener().onContact(this, other);
        this.changeEnergy(-this.params.stepAgentEnergy.getValue(), { getName: () => "Bump Agent" });

        if (this.canEatAgent(other)) {
            this.eatAgent(other);
        }
    }

    receiveBroadcast() {
        const packet = this.environment.getPlugin(PacketConduit).findPacket(this.position, this);
        if (packet) packet.process(this);
    }

    broadcast(packet, cause) {
        this.environment.getPlugin(PacketConduit).addPacketToList(packet);
        this.changeEnergy(-this.params.broadcastEnergyCost.getValue(), cause);
    }

    canBroadcast() {
        return this.params.broadcastMode && this.getEnergy() >= this.params.broadcastEnergyMin.getValue();
    }

    canEat(dest) {
        return this.params.foodweb.canEatFood[this.environment.getFoodType(dest)];
    }

    canEatAgent(other) {
        return this.params.foodweb.canEatAgent[other.getType()];
    }

    eat(dest) {
        const foodType = this.environment.getFoodType(dest);
        this.environment.removeFood(dest);
        if (foodType === this.getType()) {
            this.changeEnergy(+this.params.foodEnergy.getValue(), { getName: () => "Eat Favorite Food" });
        } else {
            this.changeEnergy(+this.params.otherFoodEnergy.getValue(), { getName: () => "Eat Food" });
        }
        this.simulation.getAgentListener().onConsumeFood(this, foodType);
    }

    eatAgent(other) {
        const gain = other.getEnergy() * this.params.agentFoodEnergy.getValue();
        this.changeEnergy(gain, { getName: () => "Eat Agent" });
        this.simulation.getAgentListener().onConsumeAgent(this, other);
        other.die();
    }

    die() {
        this.super_die();
        this.changeEnergy(Math.min(0, -this.getEnergy()), { getName: () => "Death" });
        this.simulation.getAgentListener().onDeath(this);
        this.move(null);
        if (this.badAgentMemory) this.badAgentMemory.clear();
    }

    getAge() {
        return this.simulation.getTime() - this.birthTick;
    }

    clearCommInbox() {
        this.commInbox = 0;
    }

    setController(controller) {
        this.controller = controller;
    }

    setMemoryBuffer(val) {
        this.memoryBuffer = val;
    }

    setCommOutbox(val) {
        this.commOutbox = val;
    }

    setCommInbox(val) {
        this.commInbox = val;
    }

    getEnergy() {
        return this.energy;
    }
}
