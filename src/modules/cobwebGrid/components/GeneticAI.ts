// GeneticAI.ts
import { ComplexAgent } from "../processing/ComplexAgent";
import { LinearWeightsController } from "../processing/ai/LinearWeightsController";
import { LinearWeightsControllerParams } from "../processing/ai/LinearWeightsControllerParams.ts";

export class GeneticAI {
    static createController(agent: ComplexAgent, params: LinearWeightsControllerParams): LinearWeightsController {
        const controller = new LinearWeightsController(agent.simulation, params, agent.getType?.() ?? 0);

        // Random initialization of weights: 1 row of 8 values
        controller["data"] = [Array.from({ length: 8 }, () => Math.random() * 2 - 1)];

        return controller;
    }

    static createChildAsexual(parent: LinearWeightsController): LinearWeightsController {
        const weights: number[][] = parent["data"];
        const mutated: number[][] = weights.map((row: number[]) =>
            row.map((weight: number) =>
                weight + (Math.random() - 0.5) * 0.1
            )
        );

        const child = new LinearWeightsController(parent.simulator, parent.stats, parent.agentType);
        child["data"] = mutated;
        console.log("Mutation Happen")
        return child;
    }
}
