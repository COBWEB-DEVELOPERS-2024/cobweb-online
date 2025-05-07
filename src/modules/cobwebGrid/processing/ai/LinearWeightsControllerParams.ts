import { ControllerParams } from '../ControllerParams';
import { LinearWeightsController } from './LinearWeightsController';
import { LinearWeightAgentParam } from './LinearWeightAgentParam';
import { SimulationParams } from '../SimulationParams';

export class LinearWeightsControllerParams extends ControllerParams {
    simParam: SimulationParams;
    agentParams: LinearWeightAgentParam[];
    runningOutputMean: number[];

    constructor(simParam: SimulationParams) {
        super();
        this.simParam = simParam;
        this.agentParams = [];

        this.runningOutputMean = Array(LinearWeightsControllerParams.OUTPUT_COUNT).fill(0);
        this.resize(simParam);
    }

    resize(envParams: SimulationParams): void {
        const agentCount = this.simParam.getAgentTypes();
        while (this.agentParams.length < agentCount) {
            this.agentParams.push(new LinearWeightAgentParam(envParams));
        }
        for (const p of this.agentParams) {
            p.resize(envParams);
        }
    }

    createController(sim: any, type: number): LinearWeightsController {
        return new LinearWeightsController(sim, this, type);
    }

    updateStats(outputIndex: number, value: number): void {
        const UPDATE_RATE = 0.001;
        this.runningOutputMean[outputIndex] *= (1 - UPDATE_RATE);
        this.runningOutputMean[outputIndex] += UPDATE_RATE * value;
    }

    getRunningOutputMean(): number[] {
        return this.runningOutputMean;
    }

    static get INPUT_COUNT(): number {
        return 14;
    }

    static get OUTPUT_COUNT(): number {
        return 6;
    }

    static get inputNames(): string[] {
        return [
            "Constant", "Energy", "Distance to agent", "Distance to food",
            "Distance to obstacle", "Direction", "Memory", "Communication",
            "Age", "Random", "Facing North", "Facing East", "Facing South", "Facing West"
        ];
    }

    static get outputNames(): string[] {
        return [
            "Memory", "Communication", "Left", "Right", "Forward", "Asexual Breed"
        ];
    }
}
