export class AgentSpawner<T> {
    private agentClass: new (simulation: any, type: number) => T;
    private simulation: any;

    constructor(agentClass: new (simulation: any, type: number) => T, simulation: any) {
        this.agentClass = agentClass;
        this.simulation = simulation;
    }

    spawn(type: number): T {
        return new this.agentClass(this.simulation, type);
    }
}
