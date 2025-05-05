import { ComplexAgent } from "../processing/ComplexAgent.ts";
import { Environment } from "../../../shared/processing/core/Environment.js";
import { Location } from "../../../shared/processing/core/Location.ts";
import { Simulation } from "../processing/Simulation.ts";
import { LocationDirection } from "../../../shared/processing/core/LocationDirection.ts";
import {Direction} from "../../../shared/processing/core/Direction.ts";

type AgentData = {
    x: number;
    y: number;
    foodType: number;
};

type StoneData = {
    x: number;
    y: number;
};

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
    pipeline: GPUComputePipeline | null = null;
    agentBindGroup: GPUBindGroup | null = null;
    occupancyGridBuffer: GPUBuffer | null = null;




    constructor(simulation: Simulation, device: GPUDevice) {
        super(simulation);
        this.device = device;
        this.simulation = simulation;
    }

    async initializeGPU() {
        const agentSize = 8 * 4;

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

        const shaderModule = this.device.createShaderModule({
            code: await (await fetch('/shaders/agentUpdateShader.wgsl')).text(),
        });

        this.pipeline = this.device.createComputePipeline({
            layout: "auto",
            compute: {
                module: shaderModule,
                entryPoint: "main",
            },
        });

        this.agentBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.agentBuffer! } },
                { binding: 1, resource: { buffer: this.foodBuffer! } },
                { binding: 2, resource: { buffer: this.stoneBuffer! } },
                { binding: 3, resource: { buffer: this.simParamsBuffer! } },
                { binding: 4, resource: { buffer: this.occupancyGridBuffer! } },

            ],
        });
    }

    addAgent(location: Location, type = 0) {
        if (this.agents.length >= this.maxAgents) return;
        const agent = new ComplexAgent(this.simulation, type);
        agent.id = this.agents.length;
        agent.position = new LocationDirection(location);
        agent.energy = 100;
        agent.alive = true;
        this.agents.push(agent);
        this.setAgent(location, agent);
    }

    addFood(location: Location, foodType = 0) {
        this.food.push({ x: Math.floor(location.x), y: Math.floor(location.y), foodType });
    }

    addStone(location: Location) {
        this.stones.push({ x: Math.floor(location.x), y: Math.floor(location.y) });
    }

    async uploadAgentsToGPU() {
        const staging = new Uint32Array(this.maxAgents * 8);
        for (let i = 0; i < this.agents.length; i++) {
            const a = this.agents[i];
            // skip if agent does not have valid position
            if (!a.position || a.position.x < 0 || a.position.y < 0) continue;
            staging.set([
                Math.floor(a.position.x),
                Math.floor(a.position.y),
                0, 0,
                Math.floor(a.energy),
                a.alive ? 1 : 0,
                0, // direction x (GPU overwrites this)
                0  // direction y (GPU overwrites this)
            ], i * 8);
        }

        this.device.queue.writeBuffer(this.agentBuffer!, 0, staging.buffer);
    }

    async uploadFoodToGPU() {
        const active = this.food.filter(f => f.x < 64 && f.y < 64);
        this.uploadedFoodCount = active.length;
        const staging = new Uint32Array(this.maxFood * 3);
        for (let i = 0; i < active.length; i++) {
            staging.set([
                Math.floor(active[i].x),
                Math.floor(active[i].y),
                active[i].foodType
            ], i * 3);
        }
        this.device.queue.writeBuffer(this.foodBuffer!, 0, staging.buffer);
    }

    async uploadStonesToGPU() {
        const staging = new Uint32Array(this.maxStones * 2);
        for (let i = 0; i < this.stones.length; i++) {
            staging.set([
                Math.floor(this.stones[i].x),
                Math.floor(this.stones[i].y)
            ], i * 2);
        }
        this.device.queue.writeBuffer(this.stoneBuffer!, 0, staging.buffer);
    }

    async downloadAgentsFromGPU() {
        const readBuffer = this.device.createBuffer({
            size: this.maxAgents * 8 * 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        const encoder = this.device.createCommandEncoder();
        encoder.copyBufferToBuffer(this.agentBuffer!, 0, readBuffer, 0, this.maxAgents * 8 * 4);
        this.device.queue.submit([encoder.finish()]);
        await readBuffer.mapAsync(GPUMapMode.READ);

        const buffer = readBuffer.getMappedRange();
        const uintView = new Uint32Array(buffer);
        const intView = new Int32Array(buffer); // Same buffer, interpreted as signed

        for (let i = 0; i < this.agents.length; i++) {
            const agent = this.agents[i];
            const offset = i * 8;

            // skip if agent does not have a position
            if (!agent.position) continue;

            // Position
            agent.position.x = uintView[offset + 0];
            agent.position.y = uintView[offset + 1];

            // Energy and Alive status
            agent.energy = uintView[offset + 4];
            agent.alive = uintView[offset + 5] === 1;

            agent.position.direction = new Direction(
                intView[offset + 6],
                intView[offset + 7]
            );


        }

        readBuffer.unmap();
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

    async update() {
        await this.uploadAgentsToGPU();
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

    cleanUpFood() {
        this.food = this.food.filter(f => f.x >= 0 && f.y >= 0 && f.foodType !== 9999);
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
