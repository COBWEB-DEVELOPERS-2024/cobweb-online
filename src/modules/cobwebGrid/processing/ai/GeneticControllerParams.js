import { ControllerParams } from '../ControllerParams.ts';
import { GeneticController } from './GeneticController.js';
import { GeneticStateAgentParams } from './GeneticStateAgentParams.js';

export class GeneticControllerParams extends ControllerParams {
    constructor(simParams) {
        super();
        this.simParam = simParams;
        this.agentParams = [];

        this.resize(simParams);
    }

    resize(envParams) {
        const agentCount = this.simParam.getAgentTypes();
        while (this.agentParams.length < agentCount) {
            this.agentParams.push(new GeneticStateAgentParams(this.simParam));
        }
        for (const param of this.agentParams) {
            param.resize(this.simParam);
        }
    }

    createController(sim, type) {
        return new GeneticController(sim, this.agentParams[type]);
    }
}
