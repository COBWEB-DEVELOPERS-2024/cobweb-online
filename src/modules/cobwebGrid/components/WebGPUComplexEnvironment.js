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
        this.maxFood = 500;
        this.foodBuffer = null;

    }

    async initializeGPU() {
        const agentSize = 6 * 4; // pos.x, pos.y, dir.x, dir.y, energy, alive
        this.agentBuffer = this.device.createBuffer({
            size: this.maxAgents * agentSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });

        // Food buffer
        this.foodBuffer = this.device.createBuffer({
            size: this.maxFood * 3 * 4,
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
                { binding: 0, resource: { buffer: this.agentBuffer } },
                { binding: 1, resource: { buffer: this.foodBuffer } }
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

    addFood(location, foodtype = 0) {
        this.food.push({ x: location.x, y: location.y, foodtype });
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
        return this.food.filter(f => f.x >= 0 && f.y >= 0);
    }

    async uploadFoodToGPU() {
        const staging = new Float32Array(this.maxFood * 3);
        for (let i = 0; i < this.food.length; i++) {
            staging[i * 3 + 0] = this.food[i].x;
            staging[i * 3 + 1] = this.food[i].y;
            staging[i * 3 + 2] = this.food[i].ftype ?? 0;
        }
        this.device.queue.writeBuffer(this.foodBuffer, 0, staging.buffer);
    }

    async downloadAgentsFromGPU() {
        const readBuffer = this.device.createBuffer({
            size: this.maxAgents * 6 * 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        const commandEncoder = this.device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(
            this.agentBuffer,
            0,
            readBuffer,
            0,
            this.maxAgents * 6 * 4
        );

        this.device.queue.submit([commandEncoder.finish()]);
        await readBuffer.mapAsync(GPUMapMode.READ);
        const array = new Float32Array(readBuffer.getMappedRange());

        for (let i = 0; i < this.agents.length; i++) {
            this.agents[i].position.x = Math.round(array[i * 6 + 0]);
            this.agents[i].position.y = Math.round(array[i * 6 + 1]);
            this.agents[i].energy = array[i * 6 + 4];
            this.agents[i].alive = array[i * 6 + 5] === 1;
        }

        readBuffer.unmap();
    }



    async update() {
        await this.uploadFoodToGPU();
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, this.agentBindGroup);
        passEncoder.dispatchWorkgroups(Math.ceil(this.agents.length / 64));
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
        await this.downloadAgentsFromGPU();

    }

    getSimulationState() {
        return {
            agents: this.agents,
            food: this.food,
        };
    }
}
