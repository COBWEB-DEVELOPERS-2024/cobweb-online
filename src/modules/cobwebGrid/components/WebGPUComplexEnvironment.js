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
        this.stones = [];
        this.maxStones = 200;
        this.stoneBuffer = null;
        this.simParamsBuffer = null;



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

        this.stoneBuffer = this.device.createBuffer({
            size: this.maxStones * 2 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        this.simParamsBuffer = this.device.createBuffer({
            size: 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
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
                { binding: 1, resource: { buffer: this.foodBuffer } },
                { binding: 2, resource: { buffer: this.stoneBuffer } },
                { binding: 3, resource: { buffer: this.simParamsBuffer } }

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

    addFood(location, foodType = 0) {
        this.food.push({ x: location.x, y: location.y, foodType });
    }
    addStone(location) {
        this.stones.push({ x: location.x, y: location.y });
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
        const activeFood = this.food.filter(f => f.x >= 0 && f.y >= 0);
        this.uploadedFoodCount = activeFood.length; // track how many we wrote
        console.log(this.food)
        const staging = new Float32Array(this.maxFood * 3);
        for (let i = 0; i < activeFood.length; i++) {
            staging[i * 3 + 0] = activeFood[i].x;
            staging[i * 3 + 1] = activeFood[i].y;
            staging[i * 3 + 2] = activeFood[i].foodType ?? 0;
        }

        this.device.queue.writeBuffer(this.foodBuffer, 0, staging.buffer);
    }


    cleanUpFood() {
        this.food = this.food.filter(f => f.x >= 0 && f.y >= 0);
    }



    async uploadStonesToGPU() {
        const staging = new Float32Array(this.maxStones * 2);
        for (let i = 0; i < this.stones.length; i++) {
            staging[i * 2 + 0] = this.stones[i].x;
            staging[i * 2 + 1] = this.stones[i].y;
        }
        this.device.queue.writeBuffer(this.stoneBuffer, 0, staging.buffer);
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
    async downloadFoodFromGPU() {
        const readBuffer = this.device.createBuffer({
            size: this.maxFood * 3 * 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        const encoder = this.device.createCommandEncoder();
        encoder.copyBufferToBuffer(this.foodBuffer, 0, readBuffer, 0, this.maxFood * 3 * 4);
        this.device.queue.submit([encoder.finish()]);

        await readBuffer.mapAsync(GPUMapMode.READ);
        const array = new Float32Array(readBuffer.getMappedRange());

        // Only update the ones we know were uploaded
        for (let i = 0; i < this.uploadedFoodCount; i++) {
            this.food[i].x = array[i * 3 + 0];
            this.food[i].y = array[i * 3 + 1];
            this.food[i].foodType = array[i * 3 + 2];
        }
        console.log(this.food)

        readBuffer.unmap();
    }






    async update() {
        await this.uploadFoodToGPU();
        await this.uploadStonesToGPU();
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, this.agentBindGroup);
        passEncoder.dispatchWorkgroups(Math.ceil(this.agents.length / 64));
        passEncoder.end();
        const rand = Math.floor(Math.random() * 1000000);
        this.device.queue.writeBuffer(this.simParamsBuffer, 0, new Uint32Array([rand]));

        this.device.queue.submit([commandEncoder.finish()]);
        await this.downloadAgentsFromGPU();
        await this.downloadFoodFromGPU();
        this.cleanUpFood();

    }

    getSimulationState() {
        return {
            agents: this.agents,
            food: this.food,
        };
    }
}
