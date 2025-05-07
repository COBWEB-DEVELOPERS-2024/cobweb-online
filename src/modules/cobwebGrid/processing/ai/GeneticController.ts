import { BehaviorArray } from "./BehaviorArray";
import { BitField } from "../utils/BitField";
import { GeneticStateAgentParams } from "./GeneticStateAgentParams";
import { ComplexAgent } from "../ComplexAgent";
import { ControllerInput } from "../../../../shared/processing/core/ControllerInput";
import { VisionState } from "../plugins/VisionState";
import { Random } from "../utils/Random";

// --- Optional: Define the shape of the topology system ---
type Topology = {
    getRotationBetween: (from: string, to: string) => { ordinal: () => number };
};

export class GeneticController {
    simulation: {
        getTopology(): Topology;
        getRandom(): () => number;
        getStateParameter(key: string): { getValue(agent: ComplexAgent): number };
    };

    params: GeneticStateAgentParams;
    ga: BehaviorArray;

    constructor(
        simulation: {
            getTopology(): Topology;
            getRandom(): () => number;
            getStateParameter(key: string): { getValue(agent: ComplexAgent): number };
        },
        params: GeneticStateAgentParams
    ) {
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

    controlAgent(agent: ComplexAgent, inputCallback: ControllerInput): void {
        const inputCode = this.getInputArray(agent);
        inputCallback.beforeControl?.(agent, { inputCode });

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

    createChildAsexual(): GeneticController {
        const child = new GeneticController(this.simulation, this.params);
        const rng = new Random(this.params.randomSeed); // Or use Random() without seed for full randomness
        child.ga = this.ga.copy(this.params.mutationRate, rng);
        return child;
    }

    createChildSexual(parent2: GeneticController): GeneticController {
        const child = new GeneticController(this.simulation, this.params);
        const rng = new Random(this.params.randomSeed); // Same as above
        child.ga = BehaviorArray
            .splice(this.ga, parent2.ga, rng)
            .copy(this.params.mutationRate, rng);
        return child;
    }

    similarity(other: GeneticController): number {
        return this.ga.similarity(other.ga);
    }

    getInputArray(agent: ComplexAgent): BitField {
        const inputCode = new BitField();

        inputCode.add(this.getEnergy(agent.getEnergy()), 2);

        inputCode.add(
            this.simulation
                .getTopology()
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                .getRotationBetween("NORTH", agent.getPosition().direction.toString())
                .ordinal(), 2
        );

        const vision = agent.getState<VisionState>("VisionState");
        if (vision) {
            const distLook = vision.distanceLook();
            inputCode.add(distLook?.getType?.() ?? 0, 2);
            inputCode.add(distLook?.getDist?.() ?? 0, 2);
        } else {
            inputCode.add(0, 2);
            inputCode.add(0, 2);
        }

        inputCode.add(this.quantize(agent.getMemoryBuffer(), this.params.memoryBits), this.params.memoryBits);
        inputCode.add(this.quantize(agent.getCommInbox(), this.params.communicationBits), this.params.communicationBits);

        for (const [key, size] of Object.entries(this.params.stateSizes)) {
            const value = this.simulation.getStateParameter(key).getValue(agent);
            inputCode.add(this.quantize(value, size), size);
        }

        return inputCode;
    }

    getEnergy(energy: number): number {
        if (energy > 160) return 3;
        return Math.floor((energy / 160) * 4);
    }

    quantize(val: number, bits: number): number {
        const max = (1 << bits) - 1;
        return Math.round(val * max);
    }

    dequantize(val: number, bits: number): number {
        const max = (1 << bits) - 1;
        return val / max;
    }
}
