export default class Simulation {
    constructor(device: GPUDevice): void;

    async initialize(): Promise<void>;

    addAgent(location: any, type: number): void;

    addFood(location: any, type: number): void;

    async uploadAgents(): Promise<void>;

    async step(): Promise<void>;

    getAgentData(): any[];

    getFoodData(): any[];

    getTime(): number;

    getSimulationState(): any[];
}
