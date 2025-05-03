import { ControllerParams } from '../ControllerParams.ts';
import { LinearWeightsController } from './LinearWeightsController.js';
import { LinearWeightAgentParam } from './LinearWeightAgentParam.js';

export class LinearWeightsControllerParams extends ControllerParams {
    constructor(simParam) {
        super();
        this.simParam = simParam;
        this.agentParams = [];

        this.runningOutputMean = new Array(LinearWeightsControllerParams.OUTPUT_COUNT).fill(0);

        this.resize(simParam);
    }

    resize(envParams) {
        const agentCount = this.simParam.getAgentTypes();
        while (this.agentParams.length < agentCount) {
            this.agentParams.push(new LinearWeightAgentParam(this.simParam));
        }
        for (const p of this.agentParams) {
            p.resize(this.simParam);
        }
    }

    createController(sim, type) {
        return new LinearWeightsController(sim, this, type);
    }

    updateStats(outputIndex, value) {
        const UPDATE_RATE = 0.001;
        this.runningOutputMean[outputIndex] *= (1 - UPDATE_RATE);
        this.runningOutputMean[outputIndex] += UPDATE_RATE * value;
    }

    getRunningOutputMean() {
        return this.runningOutputMean;
    }

    static get INPUT_COUNT() {
        return 14;
    }

    static get OUTPUT_COUNT() {
        return 6;
    }

    static get inputNames() {
        return [
            "Constant", "Energy", "Distance to agent", "Distance to food",
            "Distance to obstacle", "Direction", "Memory", "Communication",
            "Age", "Random", "Facing North", "Facing East", "Facing South", "Facing West"
        ];
    }

    static get outputNames() {
        return [
            "Memory", "Communication", "Left", "Right", "Forward", "Asexual Breed"
        ];
    }
}
