export class AgentSpawner {
    constructor(agentClass, simulation) {
        this.agentClass = agentClass;
        this.simulation = simulation;
    }

    spawn(type) {
        return new this.agentClass(this.simulation, type);
    }
}
