import { SimulationConfig } from "./SimulationConfig.js";
import { WebGPUComplexEnvironment } from "../components/WebGPUComplexEnvironment.js";

export class Simulation {
    constructor(device) {
        this.device = device;
        this.simulationConfig = new SimulationConfig();
        this.time = 0;

        this.environment = new WebGPUComplexEnvironment(this, device);
    }

    async initialize() {
        await this.environment.initializeGPU();
        console.log("Environment initialized!");
    }

    addAgent(location, type = 0) {

        this.environment.addAgent(location, type);
    }

    addFood(location) {
        this.environment.addFood(location);
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
}
