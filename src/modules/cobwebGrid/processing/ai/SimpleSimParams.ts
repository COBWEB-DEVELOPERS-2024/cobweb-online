import { SimulationParams } from "../SimulationParams";

export class SimpleSimParams extends SimulationParams {
    private agentTypeCount: number;
    private pluginParams: any[];

    constructor(agentTypeCount: number, pluginParams: any[] = []) {
        super();
        this.agentTypeCount = agentTypeCount;
        this.pluginParams = pluginParams;
    }

    getAgentTypes(): number {
        return this.agentTypeCount;
    }

    getPluginParameters(): any[] {
        return this.pluginParams;
    }
}
