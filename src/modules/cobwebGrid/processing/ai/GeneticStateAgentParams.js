export class GeneticStateAgentParams {
    constructor(simulationParams) {
        this.randomSeed = 42;
        this.mutationRate = 0.05;
        this.memoryBits = 2;
        this.communicationBits = 2;
        this.stateSizes = {};

        if (simulationParams) {
            this.resize(simulationParams);
        }
    }

    resize(simulationParams) {
        const validParams = simulationParams.getPluginParameters();
        const currentKeys = Object.keys(this.stateSizes);

        // Remove invalid states
        for (const key of currentKeys) {
            if (!validParams.includes(key)) {
                delete this.stateSizes[key];
            }
        }

        // Add new states
        for (const key of validParams) {
            if (!(key in this.stateSizes)) {
                this.stateSizes[key] = 0;
            }
        }
    }
}
