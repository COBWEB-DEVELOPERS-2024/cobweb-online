import { SimulationConfig } from "./SimulationConfig";
import { WebGPUComplexEnvironment } from "../components/WebGPUComplexEnvironment";
import { Location } from "../../../shared/processing/core/Location.ts";
import { ComplexAgent } from "./ComplexAgent.ts";

type MoveOptions = {
  forbidOverlap?: boolean;
  eagerUpload?: boolean;
};


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

    addRock(i: number, j: number): void {
        const loc = new Location(i, j);
        this.environment.addStone(loc);
    }
    
    removeRock(i: number, j: number): void {
        const loc = new Location(i, j);
        (this.environment as any).removeStone
      ? (this.environment as any).removeStone(loc)
      : (this.environment as any).removeStoneAt?.(i, j);
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

    getStoneData(): { x:number; y:number }[] {
        return (this.environment as any).getStones();
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

    getAgentAt(i: number, j: number) {
  const env = this.environment as any;
  return typeof env.getAgentAt === 'function' ? env.getAgentAt(i, j) : undefined;
}

getFoodIndexAt(i: number, j: number): number {
  const env = this.environment as any;
  return typeof env.getFoodIndexAt === 'function' ? env.getFoodIndexAt(i, j) : -1;
}

setAgentPositionById(agentId: number, i: number, j: number, opts?: MoveOptions): boolean {
  const env = this.environment as any;
  if (typeof env.setAgentPosition === 'function') {
    return env.setAgentPosition(agentId, new Location(i, j), opts ?? {});
  }
  return false;
}

moveAgentCell(i0: number, j0: number, i1: number, j1: number, opts?: MoveOptions): boolean {
  const env = this.environment as any;
  if (typeof env.moveAgentTo === 'function') {
    return env.moveAgentTo(i0, j0, i1, j1, opts ?? {});
  }
  const ag = this.getAgentAt(i0, j0);
  return ag ? this.setAgentPositionById(ag.id, i1, j1, opts) : false;
}

removeAgentAt(i: number, j: number): boolean {
  const env = this.environment as any;
  if (typeof env.removeAgentAt === 'function') return env.removeAgentAt(i, j);
  try {
    this.removeAgent(new Location(i, j));
    return true;
  } catch {
    return false;
  }
}

moveFoodCell(i0: number, j0: number, i1: number, j1: number, opts?: { forbidOverlap?: boolean }): boolean {
  const env = this.environment as any;
  if (typeof env.moveFoodTo === 'function') return env.moveFoodTo(i0, j0, i1, j1, opts ?? {});
  const idx = this.getFoodIndexAt(i0, j0);
  if (idx === -1) return false;
  this.removeFood(new Location(i0, j0));
  this.addFood(new Location(i1, j1), 0);
  return true;
}

removeFoodAt(i: number, j: number): boolean {
  const env = this.environment as any;
  if (typeof env.removeFoodAt === 'function') {
    env.removeFoodAt(i, j);
    return true;
  }
  try {
    this.removeFood(new Location(i, j));
    return true;
  } catch {
    return false;
  }
}
}