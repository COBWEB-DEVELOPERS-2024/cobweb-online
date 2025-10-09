import { SimulationConfig } from "./SimulationConfig";
import { WebGPUComplexEnvironment } from "../components/WebGPUComplexEnvironment";
import { Location } from "../../../shared/processing/core/Location.ts";
import { ComplexAgent } from "./ComplexAgent.ts";

export class Simulation {
    device: GPUDevice;
    simulationConfig: SimulationConfig;
    time: number;
    environment: WebGPUComplexEnvironment;

    constructor(device: GPUDevice) {
        this.device = device;
        this.simulationConfig = new SimulationConfig();
        this.time = 0;

        this.environment = new WebGPUComplexEnvironment(this, device);
    }

    async initialize(): Promise<void> {
        await this.environment.initializeGPU();
        console.log("Environment initialized! (from Simulation.ts)");
    }

    addAgent(location: Location, type: number = 0): void {
        this.environment.addAgent(location, type);
    }

    addFood(location: Location, type: number = 0): void {
        this.environment.addFood(location, type);
    }

    removeAgent(location: Location): void {
        this.environment.removeAgent(location);
    }

    removeFood(location: Location): void {
        this.environment.removeFood(location);
    }

    removeWaste(location: Location): void {
        this.environment.removeDrop(location);
    }

    clearAgents(): void {
        this.environment.clearAgents();
    }

    clearFood(): void {
        this.environment.clearFood();
    }

    clearStones(): void {
        this.environment.clearStones();
    }

    clearWaste(): void {
        this.environment.clearDrops();
    }

    clearAll(): void {
        this.clearAgents();
        this.clearFood();
        this.clearStones();
        this.clearWaste();
    }

    async uploadAgents(): Promise<void> {
        await this.environment.uploadAgentsToGPU();
    }

    async step(): Promise<void> {
        await this.environment.update();
        this.time++;
    }

    getAgentData(): ComplexAgent[] {
        return this.environment.getAgents();
    }

    getFoodData(): any[] {
        return this.environment.getFood();
    }

    getTime(): number {
        return this.time;
    }

    getSimulationState(): {
        agents: ComplexAgent[];
        food: any[];
    } {
        return {
            agents: this.getAgentData(),
            food: this.getFoodData()
        };
    }
}