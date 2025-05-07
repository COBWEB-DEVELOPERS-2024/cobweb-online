export class GeneticStateAgentParams {
    randomSeed: number = 42;
    mutationRate: number = 0.05;
    memoryBits: number = 2;
    communicationBits: number = 2;
    stateSizes: Record<string, number> = {};

    constructor(simulationParams?: any) {
    if (simulationParams) {
        this.resize(simulationParams);
    }
}

resize(simulationParams: any): void {
    const validParams: string[] = simulationParams.getPluginParameters();
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
