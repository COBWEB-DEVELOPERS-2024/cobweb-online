import { BehaviorArray } from './BehaviorArray.js';
import { BitField } from '../utils/BitField.js';

export class GeneticController {
    constructor(simulation, params) {
        this.simulation = simulation;
        this.params = params;

        const outputSizes = [2, params.memoryBits, params.communicationBits, 1];
        let inputSize = 8 + params.memoryBits + params.communicationBits;

        for (const size of Object.values(params.stateSizes)) {
            inputSize += size;
        }

        this.ga = new BehaviorArray(inputSize, outputSizes);
        this.ga.randomInit(params.randomSeed);
    }

    controlAgent(agent, inputCallback) {
        const inputCode = this.getInputArray(agent);
        inputCallback.beforeControl(agent, { inputCode });

        const outputs = this.ga.getOutput(inputCode.intValue());

        agent.setMemoryBuffer(this.dequantize(outputs[1], this.params.memoryBits));
        agent.setCommOutbox(this.dequantize(outputs[2], this.params.communicationBits));
        agent.setShouldReproduceAsex(outputs[3] !== 0);

        switch (outputs[0]) {
            case 0: agent.turnLeft(); break;
            case 1: agent.turnRight(); break;
            case 2:
            case 3: agent.step(); break;
        }
    }

    createChildAsexual() {
        const child = new GeneticController(this.simulation, this.params);
        child.ga = this.ga.copy(this.params.mutationRate, this.simulation.getRandom());
        return child;
    }

    createChildSexual(parent2) {
        const child = new GeneticController(this.simulation, this.params);
        child.ga = BehaviorArray
            .splice(this.ga, parent2.ga, this.simulation.getRandom())
            .copy(this.params.mutationRate, this.simulation.getRandom());
        return child;
    }

    similarity(other) {
        return this.ga.similarity(other.ga);
    }

    getInputArray(agent) {
        const inputCode = new BitField();

        inputCode.add(this.getEnergy(agent.getEnergy()), 2);
        inputCode.add(this.simulation.getTopology()
            .getRotationBetween('NORTH', agent.getPosition().direction)
            .ordinal(), 2);

        const get = agent.getState('VisionState').distanceLook();
        inputCode.add(get.getType(), 2);
        inputCode.add(get.getDist(), 2);

        inputCode.add(this.quantize(agent.getMemoryBuffer(), this.params.memoryBits), this.params.memoryBits);
        inputCode.add(this.quantize(agent.getCommInbox(), this.params.communicationBits), this.params.communicationBits);

        for (const [key, size] of Object.entries(this.params.stateSizes)) {
            const value = this.simulation.getStateParameter(key).getValue(agent);
            inputCode.add(this.quantize(value, size), size);
        }

        return inputCode;
    }

    getEnergy(energy) {
        if (energy > 160) return 3;
        return Math.floor((energy / 160) * 4);
    }

    quantize(val, bits) {
        const max = (1 << bits) - 1;
        return Math.round(val * max);
    }

    dequantize(val, bits) {
        const max = (1 << bits) - 1;
        return val / max;
    }
}
