import { ComplexEnvironmentParams } from "./ComplexEnvironmentParams";
import { FoodwebParams } from "./FoodwebParams";
import { ComplexAgentParams } from "./ComplexAgentParams";
import { SimulationParams } from "./SimulationParams";

export class SimulationConfig extends SimulationParams {
    randomSeed: number;
    agentTypeCount: number;

    keepOldArray: boolean;
    keepOldDrops: boolean;
    keepOldAgents: boolean;
    keepOldPackets: boolean;
    spawnNewAgents: boolean;

    envParams: ComplexEnvironmentParams;
    foodParams: FoodwebParams;
    agentParams: {
        agentParams: ComplexAgentParams[];
    };

    constructor() {
        super();
        this.randomSeed = 42;
        this.agentTypeCount = 4;

        this.keepOldArray = false;
        this.keepOldDrops = false;
        this.keepOldAgents = false;
        this.keepOldPackets = false;
        this.spawnNewAgents = true;

        this.envParams = new ComplexEnvironmentParams();
        this.foodParams = new FoodwebParams(this);
        this.agentParams = {
            agentParams: Array(this.agentTypeCount).fill(null).map(() => new ComplexAgentParams(this)),
        };
    }

    getAgentTypes(): number {
        return this.agentTypeCount;
    }

    isContinuation(): boolean {
        return this.keepOldAgents || this.keepOldArray || this.keepOldPackets || this.keepOldDrops;
    }

    getPluginParameters(): any[] {
        return [];
    }
}
