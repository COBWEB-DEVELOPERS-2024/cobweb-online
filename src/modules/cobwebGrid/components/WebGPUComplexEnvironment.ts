// ====== WebGPUComplexEnvironment.ts ======

import { ComplexAgent } from "../processing/ComplexAgent.ts";
import { Environment } from "../../../shared/processing/core/Environment.js";
import { Location } from "../../../shared/processing/core/Location.ts";
import { Simulation } from "../processing/Simulation.ts";
import { LocationDirection } from "../../../shared/processing/core/LocationDirection.ts";
import { Direction } from "../../../shared/processing/core/Direction.ts";
import { GeneticAI } from "./GeneticAI.ts";

type AgentData = { x: number; y: number; foodType: number };
type StoneData = { x: number; y: number };

export class WebGPUComplexEnvironment extends Environment {
    device: GPUDevice;
    simulation: Simulation;
    agents: ComplexAgent[] = [];
    food: AgentData[] = [];
    stones: StoneData[] = [];

    maxAgents = 1000;
    maxFood = 500;
    maxStones = 200;
    uploadedFoodCount = 0;

    agentBuffer: GPUBuffer | null = null;
    foodBuffer: GPUBuffer | null = null;
    stoneBuffer: GPUBuffer | null = null;
    simParamsBuffer: GPUBuffer | null = null;
    occupancyGridBuffer: GPUBuffer | null = null;
    weightsBuffer: GPUBuffer | null = null;
    inputBuffer: GPUBuffer | null = null;

    pipeline: GPUComputePipeline | null = null;
    agentBindGroup: GPUBindGroup | null = null;

    constructor(simulation: Simulation, device: GPUDevice) {
        super(simulation);
        this.device = device;
        this.simulation = simulation;
    }

    async initializeGPU() {
        const agentSize = 10 * 4;
        const inputCount = 8;
        const floatSize = 4;

        this.agentBuffer = this.device.createBuffer({
            size: this.maxAgents * agentSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });

        this.foodBuffer = this.device.createBuffer({
            size: this.maxFood * 3 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });

        this.stoneBuffer = this.device.createBuffer({
            size: this.maxStones * 2 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        this.simParamsBuffer = this.device.createBuffer({
            size: 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.occupancyGridBuffer = this.device.createBuffer({
            size: 64 * 64 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        this.inputBuffer = this.device.createBuffer({
            size: this.maxAgents * inputCount * floatSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        this.weightsBuffer = this.device.createBuffer({
            size: this.maxAgents * inputCount * floatSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        const shaderModule = this.device.createShaderModule({
            code: await (await fetch(`${import.meta.env.BASE_URL}shaders/agentUpdateShader.wgsl`)).text(),
        });


        this.pipeline = this.device.createComputePipeline({
            layout: "auto",
            compute: { module: shaderModule, entryPoint: "main" },
        });

        this.agentBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.agentBuffer! } },
                { binding: 1, resource: { buffer: this.foodBuffer! } },
                { binding: 2, resource: { buffer: this.stoneBuffer! } },
                { binding: 3, resource: { buffer: this.simParamsBuffer! } },
                { binding: 4, resource: { buffer: this.occupancyGridBuffer! } },
                { binding: 5, resource: { buffer: this.inputBuffer! } },
                { binding: 6, resource: { buffer: this.weightsBuffer! } },
            ],
        });
    }

    addAgent(location: Location, type = 0) {
        if (this.agents.length >= this.maxAgents) return;
        const agent = new ComplexAgent(this.simulation, type);
        agent.id = this.agents.length;
        agent.position = new LocationDirection(location);
        agent.energy = 200; // Ensure enough energy to test reproduction
        agent.alive = true;
        this.agents.push(agent);
        this.setAgent(location, agent);
    }

    override addFood(loc: Location, type: number): void {
        super.addFood(loc, type);
        this.food.push({ x: loc.x, y: loc.y, foodType: type });
    }


    getStones() {
        return this.stones;
    }

    override addStone(loc: Location): void {
        if (this.hasStone(loc) || this.hasAgent(loc) || this.hasDrop(loc)) return;
        super.addStone(loc);
        this.stones.push({ x: loc.x, y: loc.y });
        this.uploadStonesToGPU();
    }

    removeStone(loc: Location): void {
        super.removeStone(loc);
        this.stones = this.stones.filter(s => !(s.x === loc.x && s.y === loc.y));
        this.uploadStonesToGPU();
    }

    async uploadAgentsToGPU() {
        const staging = new Uint32Array(this.maxAgents * 10);
        for (let i = 0; i < this.agents.length; i++) {
            const a = this.agents[i];
            staging.set([
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error

                Math.floor(a.position.x),
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                Math.floor(a.position.y),
                0, 0,
                Math.floor(a.energy),
                a.alive ? 1 : 0,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                a.position.direction?.x ?? 0,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                a.position.direction?.y ?? 0,
                i * 8,
                0,
            ], i * 10);
        }
        this.device.queue.writeBuffer(this.agentBuffer!, 0, staging.buffer);
    }

    async uploadInputsToGPU() {
        const inputArray = new Float32Array(this.maxAgents * 8);
        for (let i = 0; i < this.agents.length; i++) {
            const a = this.agents[i];
            inputArray.set([
                1.0,
                a.energy / 160.0,
                0.5,
                0.5,
                0.5,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                a.position.direction?.x ?? 0,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                a.position.direction?.y ?? 0,
                Math.random()
            ], i * 8);
        }
        this.device.queue.writeBuffer(this.inputBuffer!, 0, inputArray);
    }

    async uploadWeightsToGPU() {
        const weightsArray = new Float32Array(this.maxAgents * 8);
        for (let i = 0; i < this.agents.length; i++) {
            const agent = this.agents[i];
            const type = agent.type;
            const params = this.simulation.simulationConfig.agentParams.agentParams[type];
            if (!agent.controller) {
                const ctrl = GeneticAI.createController(agent, params.controllerParams);
                const weights: number[][] = (ctrl as any).data;

                // Ensure bias term has influence
                if (weights[0].every(w => Math.abs(w) < 0.01)) {
                    weights[0][0] = 1.0;  // Set bias term (input 0 = 1.0)
                }

                agent.setController(ctrl);
            }

            const weights: number[][] = (agent.controller as any).data;
            weightsArray.set(weights[0], i * 8);
        }

        this.device.queue.writeBuffer(this.weightsBuffer!, 0, weightsArray);
    }

    async update() {
        await this.uploadAgentsToGPU();
        await this.uploadInputsToGPU();
        await this.uploadWeightsToGPU();
        await this.uploadFoodToGPU();
        await this.uploadStonesToGPU();

        const rand = Math.floor(Math.random() * 1000000);
        this.device.queue.writeBuffer(this.simParamsBuffer!, 0, new Uint32Array([rand]));

        const zeroGrid = new Uint32Array(64 * 64);
        this.device.queue.writeBuffer(this.occupancyGridBuffer!, 0, zeroGrid);

        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setPipeline(this.pipeline!);
        pass.setBindGroup(0, this.agentBindGroup!);
        pass.dispatchWorkgroups(Math.ceil(this.agents.length / 64));
        pass.end();
        this.device.queue.submit([encoder.finish()]);

        await this.downloadAgentsFromGPU();
        await this.downloadFoodFromGPU();
        this.cleanUpFood();
    }

    async downloadAgentsFromGPU() {
        const readBuffer = this.device.createBuffer({
            size: this.maxAgents * 10 * 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        const encoder = this.device.createCommandEncoder();
        encoder.copyBufferToBuffer(this.agentBuffer!, 0, readBuffer, 0, this.maxAgents * 10 * 4);
        this.device.queue.submit([encoder.finish()]);
        await readBuffer.mapAsync(GPUMapMode.READ);

        const uintView = new Uint32Array(readBuffer.getMappedRange());
        const intView = new Int32Array(uintView.buffer);

        for (let i = 0; i < this.agents.length; i++) {
            const agent = this.agents[i];
            const offset = i * 10;
            // Update agent state
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            agent.position.x = uintView[offset];
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            agent.position.y = uintView[offset + 1];
            agent.energy = uintView[offset + 4];
            agent.alive = uintView[offset + 5] === 1;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            agent.position.direction = new Direction(intView[offset + 6], intView[offset + 7]);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            this.setAgent(agent.position, agent);

            // Handle reproduction
            if (uintView[offset + 9] === 1 && agent.controller) {
                const childCtrl = GeneticAI.createChildAsexual(agent.controller);
                const child = new ComplexAgent(this.simulation, agent.type);
                child.setController(childCtrl);
                child.id = this.agents.length;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                child.position = new LocationDirection(new Location(agent.position.x, agent.position.y));
                child.energy = 100;
                child.alive = true;
                this.agents.push(child);
                this.setAgent(child.position, child);
                console.log(`👶 Agent ${agent.id} reproduced. Created child agent ${child.id}.`);
            }
        }

        readBuffer.unmap();
    }


    async uploadFoodToGPU() {
        const active = this.food.filter(f => f.x < 64 && f.y < 64);
        this.uploadedFoodCount = active.length;
        const staging = new Uint32Array(this.maxFood * 3);
        for (let i = 0; i < active.length; i++) {
            staging.set([active[i].x, active[i].y, active[i].foodType], i * 3);
        }
        this.device.queue.writeBuffer(this.foodBuffer!, 0, staging.buffer);
    }

    async uploadStonesToGPU() {
        const staging = new Uint32Array(this.maxStones * 2);
        for (let i = 0; i < this.stones.length; i++) {
            staging.set([this.stones[i].x, this.stones[i].y], i * 2);
        }
        this.device.queue.writeBuffer(this.stoneBuffer!, 0, staging.buffer);
    }

    // Ensure clearStones clears both the flag bits and the local/GPU-backed stone arrays
    override clearStones(): void {
        // clear local cache of stones
        this.stones = [];
        // clear flag bits using base implementation
        super.clearStones();

        // zero the GPU stone buffer so subsequent readbacks see no stones
        try {
            if (this.stoneBuffer) {
                const zeroed = new Uint32Array(this.maxStones * 2);
                this.device.queue.writeBuffer(this.stoneBuffer, 0, zeroed.buffer);
            }
        } catch (e) {
            console.warn('Failed to zero stoneBuffer during clearStones:', e);
        }

        console.log("Cleared all stones from environment.");
    }
    
    // ensure clearAgents clears both the agent table and the local/GPU-backed agent arrays
    override clearAgents(): void {
        try {
            // To avoid the error with undefined environment in agents,
            // first clear our local agents array so they won't reference environment
            this.agents = [];

            // Now call the base implementation which iterates the agent table
            super.clearAgents();

            // zero the GPU agent buffer so subsequent readbacks see no agents
            if (this.agentBuffer) {
                const zeroed = new Uint32Array(this.maxAgents * 10);
                this.device.queue.writeBuffer(this.agentBuffer, 0, zeroed.buffer);
            }

            console.log("Cleared all agents from environment.");
        } catch (e) {
            console.warn('Error during clearAgents:', e);
        }
    }
    
    // ensure clearDrops clears both the flag bits and any drop-related data
    override clearDrops(): void {
        // clear flag bits using base implementation
        super.clearDrops();
        
        // i believe drop feature is currently not implmeneted, so i guess this function is a placeholder for now?
        console.log("Cleared all waste/drops from environment.");
    }

    // Ensure clearFood clears both the flag bits and the local/GPU-backed food arrays
    override clearFood(): void {
        // clear flag bits using base implementation
        super.clearFood();

        // clear local cache and uploaded count
        this.food = [];
        this.uploadedFoodCount = 0;

        // zero the GPU food buffer so subsequent readbacks see no food
        try {
            if (this.foodBuffer) {
                const zeroed = new Uint32Array(this.maxFood * 3);
                this.device.queue.writeBuffer(this.foodBuffer, 0, zeroed.buffer);
            }
        } catch (e) {
            console.warn('Failed to zero foodBuffer during clearFood:', e);
        }

        console.log("Cleared all food from environment.");
    }

    async downloadFoodFromGPU() {
        const readBuffer = this.device.createBuffer({
            size: this.maxFood * 3 * 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        const encoder = this.device.createCommandEncoder();
        encoder.copyBufferToBuffer(this.foodBuffer!, 0, readBuffer, 0, this.maxFood * 3 * 4);
        this.device.queue.submit([encoder.finish()]);
        await readBuffer.mapAsync(GPUMapMode.READ);
        const array = new Uint32Array(readBuffer.getMappedRange());
        for (let i = 0; i < this.uploadedFoodCount; i++) {
            this.food[i].x = array[i * 3 + 0];
            this.food[i].y = array[i * 3 + 1];
            this.food[i].foodType = array[i * 3 + 2];
        }
        readBuffer.unmap();
    }

    cleanUpFood() {
        this.food = this.food.filter(f => f.foodType !== 9999 && f.foodType !== undefined);
    }

    getAgents() {
        return this.agents;
    }

    getFood() {
        return this.food;
    }
    // ======== Drag & Hit Helpers (for moving Agents / Food) ========
private clampCell(v: number) {
  return Math.max(0, Math.min(63, v));
}

private toLoc(i: number, j: number) {
  return new Location(this.clampCell(i), this.clampCell(j));
}

getAgentAt(i: number, j: number): ComplexAgent | undefined {
  return this.agents.find(
    a =>
      a.position && a.position.x === i && a.position.y === j
  );
}

getFoodIndexAt(i: number, j: number): number {
  return this.food.findIndex(f => f.x === i && f.y === j);
}

hasFoodAt(i: number, j: number): boolean {
  return this.getFoodIndexAt(i, j) !== -1;
}

removeFoodAt(i: number, j: number): void {
  const idx = this.getFoodIndexAt(i, j);
  if (idx === -1) return;

  this.food.splice(idx, 1);
  const snapshot = [...this.food];
  super.clearFood();
  for (const f of snapshot) {
    super.addFood(this.toLoc(f.x, f.y), f.foodType);
  }
  if (this.foodBuffer) {
    this.uploadFoodToGPU();
  }
}

moveFoodTo(i0: number, j0: number, i1: number, j1: number, opts?: { forbidOverlap?: boolean }): boolean {
  i1 = this.clampCell(i1);
  j1 = this.clampCell(j1);
  const idx = this.getFoodIndexAt(i0, j0);
  if (idx === -1) return false;

  if (opts?.forbidOverlap) {
    const dst = this.toLoc(i1, j1);
    if (this.hasStone(dst) || this.hasAgent(dst) || this.hasDrop(dst) || this.hasFoodAt(i1, j1)) {
      return false;
    }
  }

  const type = this.food[idx].foodType;
  this.food[idx].x = i1;
  this.food[idx].y = j1;
  this.food[idx].foodType = type;

  const snapshot = [...this.food];
  super.clearFood();
  for (const f of snapshot) {
    super.addFood(this.toLoc(f.x, f.y), f.foodType);
  }
  if (this.foodBuffer) {
    this.uploadFoodToGPU();
  }
  return true;
}

setAgentPosition(agentId: number, loc: Location, opts?: { forbidOverlap?: boolean; eagerUpload?: boolean }): boolean {
  const a = this.agents.find(ag => ag.id === agentId);
  if (!a) return false;

  const i1 = this.clampCell(loc.x);
  const j1 = this.clampCell(loc.y);

  if (opts?.forbidOverlap) {
    const dst = this.toLoc(i1, j1);
    if (this.hasStone(dst) || this.hasAgent(dst) || this.hasDrop(dst)) return false;
  }

  const dir = a.position?.direction ?? new Direction(0, 0);
  a.position = new LocationDirection(new Location(i1, j1), dir);
  this.setAgent(a.position, a);

  
  if (opts?.eagerUpload && this.agentBuffer) {
  this.uploadAgentsToGPU();
}

  return true;
}

removeAgentAt(i: number, j: number): boolean {
  const idx = this.agents.findIndex(a => a.position && a.position.x === i && a.position.y === j);
  if (idx === -1) return false;

  const removed = this.agents.splice(idx, 1)[0];

  // mark as death
  removed.alive = false;

  // rebuild agent table
  super.clearAgents();
  for (const ag of this.agents) {
    if (ag.position) {
      this.setAgent(new Location(ag.position.x, ag.position.y), ag);
    }
  }

  if (this.agentBuffer) {
    this.uploadAgentsToGPU();
  }

  return true;
}


moveAgentTo(i0: number, j0: number, i1: number, j1: number, opts?: { forbidOverlap?: boolean; eagerUpload?: boolean }): boolean {
  const a = this.getAgentAt(i0, j0);
  if (!a) return false;
  return this.setAgentPosition(a.id!, this.toLoc(i1, j1), opts);
}

    
    getSimulationState() {
        return {
            agents: this.agents,
            food: this.food,
        };
    }
}
