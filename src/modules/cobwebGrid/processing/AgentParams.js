import { ComplexAgentParams } from "./ComplexAgentParams.js";

export class AgentParams {
    constructor(agentTypeCount = 1) {
        this.agentParams = [];
        for (let i = 0; i < agentTypeCount; i++) {
            this.agentParams.push(new ComplexAgentParams(agentTypeCount));
        }
    }

    resize(agentTypeCount) {
        while (this.agentParams.length < agentTypeCount) {
            this.agentParams.push(new ComplexAgentParams(agentTypeCount));
        }
        this.agentParams.length = agentTypeCount;

        for (const p of this.agentParams) {
            p.resize(agentTypeCount);
        }
    }
}
