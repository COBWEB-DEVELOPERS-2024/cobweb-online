import { LinearWeightsControllerParams } from './LinearWeightsControllerParams.js';

export class LinearWeightAgentParam {
    constructor(simParam) {
        this.simParam = simParam;
        this.dataInitial = [];
        this.mutationRate = 0.05;
    }

    resize(envParams) {
        const newRows = LinearWeightsControllerParams.INPUT_COUNT + this.simParam.getPluginParameters().length;
        const newCols = LinearWeightsControllerParams.OUTPUT_COUNT;

        const resized = [];
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
