import { ComplexAgent } from "../processing/ComplexAgent.js";
import { Environment } from "../../../shared/processing/core/Environment.js";


export class WebGPUComplexEnvironment extends Environment {
    constructor(simulation, device) {
        super(simulation);
        this.device = device;
        this.simulation = simulation;

        this.agents = [];
        this.food = [];

        this.maxAgents = 1000;
        this.agentBuffer = null;
        this.agentBindGroup = null;
        this.pipeline = null;
    }

    async initializeGPU() {
        const agentSize = 6 * 4; // pos.x, pos.y, dir.x, dir.y, energy, alive
        this.agentBuffer = this.device.createBuffer({
            size: this.maxAgents * agentSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });

        const shaderModule = this.device.createShaderModule({
            code: await (await fetch('/shaders/agentUpdateShader.wgsl')).text()
        });

        this.pipeline = this.device.createComputePipeline({
            layout: "auto",
            compute: {
                module: shaderModule,
                entryPoint: "main",
            }
        });

        this.agentBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.agentBuffer } }
            ]
        });
    }

    addAgent(location, type = 0) {
        if (!this.simulation || typeof this.simulation.getTime !== 'function') {
            throw new Error("addAgent() called before simulation was initialized properly!");
        }

        if (this.agents.length >= this.maxAgents) {
            console.warn("Max agent limit reached!");
            return;
        }

        const agent = new ComplexAgent(this.simulation, type);
        agent.id = this.agents.length;
        agent.position = location;
        agent.energy = 100;
        agent.alive = true;

        this.agents.push(agent);
        this.setAgent(location, agent);
    }

    addFood(location) {
        this.food.push({ x: location.x, y: location.y });
    }

    async uploadAgentsToGPU() {
        const stagingArray = new Float32Array(this.maxAgents * 6);
        for (let i = 0; i < this.agents.length; i++) {
            const agent = this.agents[i];
            stagingArray[i * 6 + 0] = agent.position.x;
            stagingArray[i * 6 + 1] = agent.position.y;
            stagingArray[i * 6 + 2] = 0; // dir.x
            stagingArray[i * 6 + 3] = 0; // dir.y
            stagingArray[i * 6 + 4] = agent.energy;
            stagingArray[i * 6 + 5] = agent.alive ? 1 : 0;
        }

        this.device.queue.writeBuffer(
            this.agentBuffer,
            0,
            stagingArray.buffer,
            stagingArray.byteOffset,
            stagingArray.byteLength
        );
    }

    getAgents() {
        return this.agents;
    }

    getFood() {
        return this.food;
    }

    async update() {
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, this.agentBindGroup);
        passEncoder.dispatchWorkgroups(Math.ceil(this.agents.length / 64));
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }

    getSimulationState() {
        return {
            agents: this.agents,
            food: this.food,
        };
    }
}
