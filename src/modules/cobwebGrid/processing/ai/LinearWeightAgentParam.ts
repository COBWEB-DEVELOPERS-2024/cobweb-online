import { LinearWeightsControllerParams } from './LinearWeightsControllerParams';
import { SimulationParams } from '../SimulationParams';

export class LinearWeightAgentParam {
    simParam: SimulationParams;
    dataInitial: number[][];
    mutationRate: number;

    constructor(simParam: SimulationParams) {
        this.simParam = simParam;
        this.dataInitial = [];
        this.mutationRate = 0.05;
    }

    resize(envParams: SimulationParams): void {
        const newRows = LinearWeightsControllerParams.INPUT_COUNT + envParams.getPluginParameters().length;
        const newCols = LinearWeightsControllerParams.OUTPUT_COUNT;

        const resized: number[][] = [];

        for (let i = 0; i < newRows; i++) {
            resized.push([]);
            for (let j = 0; j < newCols; j++) {
                if (this.dataInitial[i] && this.dataInitial[i][j] !== undefined) {
                    resized[i][j] = this.dataInitial[i][j];
                } else {
                    resized[i][j] = 0;
                }
            }
        }

        this.dataInitial = resized;
    }
}
