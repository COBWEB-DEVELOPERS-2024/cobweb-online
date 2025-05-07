import { ControllerParams } from "../ControllerParams";
import { GeneticStateAgentParams } from "./GeneticStateAgentParams";
import { GeneticController } from "./GeneticController";

export class GeneticControllerParams extends ControllerParams {
    simParam: any;
    agentParams: GeneticStateAgentParams[] = [];

    constructor(simParams: any) {
        super();
        this.simParam = simParams;
        this.resize(simParams);
    }

    resize(envParams: any): void {
        const agentCount = this.simParam.getAgentTypes();
        while (this.agentParams.length < agentCount) {
            this.agentParams.push(new GeneticStateAgentParams(this.simParam));
        }
        for (const param of this.agentParams) {
            param.resize(envParams);
        }

    }

    createController(sim: any, type: number): GeneticController {
        return new GeneticController(sim, this.agentParams[type]);
    }
}
