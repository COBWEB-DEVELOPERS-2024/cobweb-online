import { ComplexAgentParams } from "./ComplexAgentParams";

export class AgentParams {
    agentParams: ComplexAgentParams[];

    constructor(agentTypeCount: number = 1) {
        this.agentParams = [];
        for (let i = 0; i < agentTypeCount; i++) {
            this.agentParams.push(new ComplexAgentParams({
                getAgentTypes: () => agentTypeCount
            }));
        }

    }

    resize(agentTypeCount: number): void {
        while (this.agentParams.length < agentTypeCount) {
            this.agentParams.push(new ComplexAgentParams({
                getAgentTypes: () => agentTypeCount
            }));
        }

        this.agentParams.length = agentTypeCount;

        for (const p of this.agentParams) {
            p.resize({ getAgentTypes: () => agentTypeCount });
        }

    }
}
