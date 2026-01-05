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

    // TODO: unify stones methods to use location class as parameter
    addStone(i: number, j: number): void {
        const loc = new Location(i, j);
        this.environment.addStone(loc);
    }
    
    removeStone(i: number, j: number): void {
        // debug log
        console.log(`Removing stone at (${i}, ${j})`);

        const loc = new Location(i, j);
        (this.environment as any).removeStone
      ? (this.environment as any).removeStone(loc)
      : (this.environment as any).removeStoneAt?.(i, j);
    }

    removeAllFood(): void {
        const food = this.getFoodData();
        for (const f of food) {
            this.environment.removeFood(new Location(f.x, f.y));
        }
    }
    
    removeAllStones(): void {
        const stones = this.getStoneData();
        for (const stone of stones) {
            // remove stone from previous implementation uses i, j instead of location class
            // TODO: unify the implementation of getStoneData/FoodData etc
            this.environment.removeStone(stone);
        }
    }

    removeAllAgents(): void {
        console.log('removeAllAgents called in Simulation.ts');
        this.environment.removeAllAgents();
        console.log('removeAllAgents complete');
    }

    removeAllWaste(): void {
        this.environment.removeAllWaste();
    }

    removeAll(): void {
        this.removeAllStones();
        this.removeAllFood();
        this.removeAllAgents();
        this.removeAllWaste();
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

    getStoneData(): any[] {
        return this.environment.getStones();
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

    // getagentlistener is referenced mutiple times in ComplexAgent.ts as a method to the simulation.ts class
    // however, it was never implemented, so here is a placeholder implementation
    // TODO: implement actual agent listener methods for event tracking, should be in a different feature
    getAgentListener(): any {
        return {
            onDeath: () => {},
            onConsumeFood: () => {},
            onConsumeAgent: () => {},
            onStep: () => {},
            onTryStep: (_agent: any, _from: any, newPos: any) => newPos,
            onNextMove: () => true,
            onContact: () => {},
            onSpawn: () => {},
            onSpawnSingle: () => {},
            onSpawnSolo: () => {},
            onEnergyChange: () => {},
            onUpdate: () => {},
            beforeControl: () => {}
        };
    }
}