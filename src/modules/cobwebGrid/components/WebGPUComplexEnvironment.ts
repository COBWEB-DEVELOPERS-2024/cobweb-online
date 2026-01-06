// ====== WebGPUComplexEnvironment.ts ======

import { ComplexAgent } from "../processing/ComplexAgent.ts";
import { Environment } from "../../../shared/processing/core/Environment.js";
import { Location } from "../../../shared/processing/core/Location.ts";
import { Simulation } from "../processing/Simulation.ts";
import { LocationDirection } from "../../../shared/processing/core/LocationDirection.ts";
import { Direction } from "../../../shared/processing/core/Direction.ts";
import { GeneticAI } from "./GeneticAI.ts";

type FoodData = { x: number; y: number; foodType: number };
type StoneData = { x: number; y: number };
type WasteData = { x: number; y: number };

export class WebGPUComplexEnvironment extends Environment {
    device: GPUDevice;
    simulation: Simulation;
    agents: ComplexAgent[] = [];
    food: FoodData[] = [];
    stones: StoneData[] = [];
    waste: WasteData[] = [];

    maxAgents = 1000;
    maxFood = 500;
    maxStones = 200;
    maxWaste = 200;
    uploadedFoodCount = 0;

    agentBuffer: GPUBuffer | null = null;
    foodBuffer: GPUBuffer | null = null;
    stoneBuffer: GPUBuffer | null = null;
    wasteBuffer: GPUBuffer | null = null;
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

        this.wasteBuffer = this.device.createBuffer({
            size: this.maxWaste * 2 * 4,
            // TODO: check if this size is accurate
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

    addAgent(loc: Location, type = 0) {
        // check for existing food, stones, agents, waste
        if (this.hasAgent(loc) || this.hasFood(loc) || this.hasStone(loc) || this.hasWaste(loc)) {
            return;
        }
        if (this.agents.length >= this.maxAgents) return;
        const agent = new ComplexAgent(this.simulation, type);
        agent.id = this.agents.length;
        agent.position = new LocationDirection(loc);
        agent.energy = 200; // Ensure enough energy to test reproduction
        agent.alive = true;
        this.agents.push(agent);
        this.setAgent(loc, agent);
    }

    override addFood(loc: Location, type: number): void {
        // check for existing food, stones, agents, waste
        if (this.hasAgent(loc) || this.hasFood(loc) || this.hasStone(loc) || this.hasWaste(loc)) {
            // // debug log
            // console.log(`Cannot add food at (${loc.x}, ${loc.y}): space occupied.`);
            return;
        }
        super.addFood(loc, type);
        this.food.push({ x: loc.x, y: loc.y, foodType: type });

        // // debug log
        // console.log(`Added food at grid position (${loc.x}, ${loc.y})`);
    }

    getStones() {
        return this.stones;
    }

    override addStone(loc: Location): void {
        // check for existing food, stones, agents, waste
        if (this.hasAgent(loc) || this.hasFood(loc) || this.hasStone(loc) || this.hasWaste(loc)) {
            return;
        }
        if (this.hasStone(loc) || this.hasAgent(loc) || this.hasWaste(loc)) return;
        super.addStone(loc);
        this.stones.push({ x: loc.x, y: loc.y });
        this.uploadStonesToGPU();
    }

    removeStone(loc: Location): void {
        super.removeStone(loc);
        this.stones = this.stones.filter(s => !(s.x === loc.x && s.y === loc.y));
        this.uploadStonesToGPU();
    }
    
    removeFood(loc: Location): void {
        super.removeFood(loc);
        this.food = this.food.filter(f => !(f.x === loc.x && f.y === loc.y));
        this.uploadFoodToGPU();
    }

    removeAgent(loc: Location): void {
        super.removeAgent(loc);
        this.agents = this.agents.filter(a => {
            // it is possible for agent to have null location
            const x = a.position?.x ?? 0;
            const y = a.position?.y ?? 0;
            return !(x === loc.x && y === loc.y);
        });
        this.uploadAgentsToGPU();
    }


    removeWaste(loc: Location): void {
        // TODO: test these methods after waste functionality are implemented
        super.removeWaste(loc);
        this.waste = this.waste.filter(w => !(w.x === loc.x && w.y === loc.y));
        this.uploadWasteToGPU();
    }

    removeAllFood(): void {
        // Iterate over entire grid to remove food from every location
        for (let x = 0; x < 64; x++) {
            for (let y = 0; y < 64; y++) {
                const loc = new Location(x, y);
                if (this.hasFood(loc)) {
                    super.removeFood(loc);  // Remove from environment's internal grid
                }
            }
        }
        // empty local food array
        this.food = [];
        this.uploadFoodToGPU();
    }

    removeAllStones(): void {
        // Iterate over entire grid to remove stones from every location
        for (let x = 0; x < 64; x++) {
            for (let y = 0; y < 64; y++) {
                const loc = new Location(x, y);
                if (this.hasStone(loc)) {
                    super.removeStone(loc);  // Remove from environment's internal grid
                }
            }
        }
        // empty local food array
        this.stones = [];
        this.uploadStonesToGPU();
    }

    removeAllAgents(): void {
        // // debug logs
        // console.log('removeAllAgents called in WebGPUComplexEnvironment');
        // console.log('Agents before removal:', this.agents.length);
        
        // Iterate over entire grid to remove agents from every location
        for (let x = 0; x < 64; x++) {
            for (let y = 0; y < 64; y++) {
                const loc = new Location(x, y);
                if (this.hasAgent(loc)) {
                    console.log(`🤖 Removing agent at (${x}, ${y})`);
                    super.removeAgent(loc);  // Remove from environment's internal grid
                }
            }
        }

        // empty local agent array
        this.agents = [];

        // // debug logs
        // console.log('Agents after removal:', this.agents.length);

        this.uploadAgentsToGPU();
    }

    removeAllWaste(): void {
        // TODO: test these methods after waste functionality are implemented
        for (let x = 0; x < 64; x++) {
            for (let y = 0; y < 64; y++) {
                const loc = new Location(x, y);
                if (this.hasWaste(loc)) {
                    super.removeWaste(loc);  // Remove from environment's internal grid
                }
            }
        }
        // Clear the local waste tracking array
        this.waste = [];
        this.uploadWasteToGPU();
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

    async uploadWasteToGPU() {
        // TODO: test waste uploading after waste functionality are implemented
        // Collect all waste positions from the 2D wasteArray (inherited from Environment)
        this.waste = [];
        for (let x = 0; x < 64; x++) {
            for (let y = 0; y < 64; y++) {
                if (this.wasteArray[x]?.[y]) {
                    this.waste.push({ x, y });
                }
            }
        }

        // Upload to GPU buffer (same format as stones: x, y pairs)
        const staging = new Uint32Array(this.maxWaste * 2);
        for (let i = 0; i < Math.min(this.waste.length, this.maxWaste); i++) {
            staging.set([this.waste[i].x, this.waste[i].y], i * 2);
        }
        this.device.queue.writeBuffer(this.wasteBuffer!, 0, staging.buffer);
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

    getSimulationState() {
        return {
            agents: this.agents,
            food: this.food,
        };
    }
}
