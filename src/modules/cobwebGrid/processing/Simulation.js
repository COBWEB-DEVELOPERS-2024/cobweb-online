import { ComplexEnvironmentParams } from './ComplexEnvironmentParams.js';
import { FoodwebParams } from './FoodwebParams.js';
import { ComplexAgentParams } from './ComplexAgentParams.js';

export class SimulationConfig {
    constructor() {
        this.randomSeed = 42;
        this.agentTypeCount = 4;
        this.keepOldArray = false;
        this.keepOldDrops = false;
        this.keepOldAgents = false;
        this.spawnNewAgents = true;
        this.keepOldPackets = false;

        this.envParams = new ComplexEnvironmentParams();
        this.foodParams = new FoodwebParams();
        this.agentParams = {
            agentParams: Array(this.agentTypeCount).fill().map(() => new ComplexAgentParams()),
        };
    }

    getAgentTypes() {
        return this.agentTypeCount;
    }

    isContinuation() {
        return this.keepOldAgents || this.keepOldArray || this.keepOldPackets || this.keepOldDrops;
    }

    getPluginParameters() {
        return [];
    }
}
