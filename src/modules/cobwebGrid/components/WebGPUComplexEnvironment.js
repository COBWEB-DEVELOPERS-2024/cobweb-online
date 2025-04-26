import { ComplexAgent } from '../processing/ComplexAgent.js';
import { Environment } from '../../../shared/processing/core/Environment.js';




export class WebGPUComplexEnvironment extends Environment {
    constructor(simulation, device) {
        super(simulation);
        this.device = device;

        // Agent data (buffers)
        this.agentCount = 0;
        this.maxAgents = 1000;
        this.positions = [];
        this.energies = [];
        this.alives = [];

        // GPU buffers
        this.agentBuffer = null;
        this.agentBindGroup = null;
        this.pipeline = null;
    }

    async initializeGPU() {
        // Create agent storage buffer
        this.agentBuffer = this.device.createBuffer({
            size: this.maxAgents * 5 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });

        // Load shader module
        const shaderModule = this.device.createShaderModule({
            code: await (await fetch('/modules/cobwebGrid/processing/webgpu/agentUpdateShader.wgsl')).text()
        });

        this.pipeline = this.device.createComputePipeline({
            layout: "auto",
            compute: {
                module: shaderModule,
                entryPoint: "main"
            }
        });

        this.agentBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.agentBuffer,
                    }
                }
            ]
        });
    }

    addAgent(location, type = 0) {
        if (this.agentCount >= this.maxAgents) {
            console.warn("Max agent limit reached!");
            return;
        }

        const agent = new ComplexAgent(type);
        agent.id = this.agentCount;
        agent.position = location;
        agent.energy = 100;

        this.positions.push(location.x, location.y);
        this.energies.push(agent.energy);
        this.alives.push(1);
        this.setAgent(location, agent);

        this.agentCount++;
    }

    async uploadAgentsToGPU() {
        const stagingArray = new Float32Array(this.maxAgents * 5);

        for (let i = 0; i < this.agentCount; i++) {
            stagingArray[i * 5 + 0] = this.positions[i * 2 + 0];
            stagingArray[i * 5 + 1] = this.positions[i * 2 + 1];
            stagingArray[i * 5 + 2] = 0; // dx
            stagingArray[i * 5 + 3] = 0; // dy
            stagingArray[i * 5 + 4] = this.energies[i];
        }

        this.device.queue.writeBuffer(this.agentBuffer, 0, stagingArray.buffer, stagingArray.byteOffset, stagingArray.byteLength);
    }

    async update() {
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, this.agentBindGroup);
        passEncoder.dispatchWorkgroups(Math.ceil(this.agentCount / 64));
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }
}
