export class SimulationParams {
    getAgentTypes() {
        throw new Error('getAgentTypes must be implemented');
    }

    getPluginParameters() {
        throw new Error('getPluginParameters must be implemented');
    }
}
