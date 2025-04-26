import { Topology } from './Topology.js';
import { Location } from './Location.js';
import { Drop } from './Drop.js';
import { Updatable } from './Updatable.js';

export class Environment extends Updatable {
    static FLAG_STONE = 1;
    static FLAG_FOOD = 2;
    static FLAG_AGENT = 3;
    static FLAG_DROP = 4;

    constructor(simulation) {
        super();
        this.simulation = simulation;
        this.topology = null;
        this.agentTable = new Map();
        this.flagArray = [];
        this.foodTypeArray = [];
        this.dropArray = [];
    }

    load(width, height, wrap, keepOldArray) {
        this.topology = new Topology(this.simulation, width, height, wrap);

        if (!keepOldArray) {
            this.flagArray = Array.from({ length: width }, () => Array(height).fill(0));
            this.foodTypeArray = Array.from({ length: width }, () => Array(height).fill(0));
            this.dropArray = Array.from({ length: width }, () => Array(height).fill(null));
        }
    }

    clearAgents() {
        for (let agent of this.getAgents()) {
            agent.die();
        }
        this.agentTable.clear();
    }

    getAgent(location) {
        return this.agentTable.get(this._locKey(location));
    }

    getAgents() {
        return Array.from(this.agentTable.values());
    }

    getAgentCount() {
        return this.agentTable.size;
    }

    getClosestAgent(agent) {
        const l1 = agent.getPosition();
        let closest = null;
        let closestDistance = Math.sqrt(this.topology.width ** 2 + this.topology.height ** 2);

        for (const [locKey, otherAgent] of this.agentTable.entries()) {
            const loc = this._parseLocKey(locKey);
            const dist = this.topology.getDistance(loc, l1);
            if (dist < closestDistance) {
                closest = otherAgent;
                closestDistance = dist;
            }
        }
        return closest;
    }

    setAgent(location, agent) {
        if (agent)
            this.agentTable.set(this._locKey(location), agent);
        else
            this.agentTable.delete(this._locKey(location));
    }

    _locKey(location) {
        return `${location.x},${location.y}`;
    }

    _parseLocKey(key) {
        const [x, y] = key.split(',').map(Number);
        return new Location(x, y);
    }

    getLocationBits(location) {
        return this.flagArray[location.x][location.y];
    }

    setLocationBits(location, bits) {
        this.flagArray[location.x][location.y] = bits;
    }

    setFlag(location, flag, state) {
        const flagBits = 1 << (flag - 1);
        console.assert(!(state && this.getLocationBits(location) !== 0), "Attempted to set flag when flags non-zero");
        console.assert(!(!state && (this.getLocationBits(location) & flagBits) === 0), "Attempting to unset an unset flag");

        let newValue = this.getLocationBits(location);

        if (state)
            newValue |= flagBits;
        else
            newValue &= ~flagBits;

        this.setLocationBits(location, newValue);
    }

    testFlag(location, flag) {
        const flagBits = 1 << (flag - 1);
        return (this.getLocationBits(location) & flagBits) !== 0;
    }

    getFoodType(location) {
        return this.foodTypeArray[location.x][location.y];
    }

    addFood(location, type) {
        if (this.hasStone(location)) {
            throw new Error("stone here already");
        }
        this.setFlag(location, Environment.FLAG_FOOD, true);
        this.foodTypeArray[location.x][location.y] = type;
    }

    clearFood() {
        this.clearFlag(Environment.FLAG_FOOD);
    }

    removeFood(location) {
        this.setFlag(location, Environment.FLAG_FOOD, false);
    }

    hasFood(location) {
        return this.testFlag(location, Environment.FLAG_FOOD);
    }

    clearFlag(flag) {
        for (let x = 0; x < this.topology.width; ++x) {
            for (let y = 0; y < this.topology.height; ++y) {
                const loc = new Location(x, y);
                if (this.testFlag(loc, flag)) {
                    if (flag === Environment.FLAG_DROP) {
                        this.removeDrop(loc);
                    } else {
                        this.setFlag(loc, flag, false);
                    }
                }
            }
        }
    }

    addStone(location) {
        if (this.hasAgent(location)) return;
        if (this.hasFood(location)) this.removeFood(location);
        if (this.testFlag(location, Environment.FLAG_DROP)) this.setFlag(location, Environment.FLAG_DROP, false);
        this.setFlag(location, Environment.FLAG_STONE, true);
    }

    clearStones() {
        this.clearFlag(Environment.FLAG_STONE);
    }

    hasAnythingAt(location) {
        return this.getLocationBits(location) !== 0 || this.hasAgent(location);
    }

    removeStone(location) {
        this.setFlag(location, Environment.FLAG_STONE, false);
    }

    addDrop(location, drop) {
        if (this.hasFood(location)) {
            this.removeFood(location);
        }
        this.setFlag(location, Environment.FLAG_DROP, true);
        this.dropArray[location.x][location.y] = drop;
    }

    removeDrop(location) {
        if (this.hasDrop(location)) {
            const drop = this.dropArray[location.x][location.y];
            drop.prepareRemove();
            this.setFlag(location, Environment.FLAG_DROP, false);
            this.dropArray[location.x][location.y] = null;
        }
    }

    getDrop(location) {
        return this.dropArray[location.x][location.y];
    }

    hasDrop(location) {
        return this.testFlag(location, Environment.FLAG_DROP);
    }

    hasStone(location) {
        return this.testFlag(location, Environment.FLAG_STONE);
    }

    hasAgent(location) {
        return this.getAgent(location) != null;
    }

    clearDrops() {
        this.clearFlag(Environment.FLAG_DROP);
    }

    killOffgridAgents() {
        for (let agent of this.getAgents()) {
            const loc = agent.getPosition();
            if (loc.x >= this.topology.width || loc.y >= this.topology.height) {
                agent.die();
            }
        }
    }

    removeAgent(location) {
        const agent = this.getAgent(location);
        if (agent) agent.die();
    }

    update() {
        // No-op for now
    }

    getNearLocations(position) {
        const result = [];
        for (const dir of this.topology.ALL_8_WAY) {
            const loc = this.topology.getAdjacent(position, dir);
            if (loc !== null && !this.hasStone(loc)) {
                result.push(loc);
            }
        }
        return result;
    }
}
