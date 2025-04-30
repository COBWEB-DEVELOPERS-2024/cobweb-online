import { SimulationConfig } from "./SimulationConfig.js";
import { WebGPUComplexEnvironment } from "../components/WebGPUComplexEnvironment.js";

export default class Simulation {
    constructor(device) {
        this.device = device;
        this.simulationConfig = new SimulationConfig();
        this.time = 0;

        this.environment = new WebGPUComplexEnvironment(this, device);
    }

    async initialize() {
        await this.environment.initializeGPU();
        console.log("Environment initialized! (from Simulation.js)");
    }

    addAgent(location, type = 0) {
        this.environment.addAgent(location, type);
    }

    addFood(location, type = 0) {
        this.environment.addFood(location, type);
    }

    async uploadAgents() {
        await this.environment.uploadAgentsToGPU();
    }

    async step() {
        await this.environment.update();
        this.time++;
    }

    getAgentData() {
        return this.environment.getAgents();
    }

    getFoodData() {
        return this.environment.getFood();
    }

    getTime() {
        return this.time;
    }

    getSimulationState() {
        return {
            agents: this.getAgentData(),
            food: this.getFoodData()
        };
    }
}
