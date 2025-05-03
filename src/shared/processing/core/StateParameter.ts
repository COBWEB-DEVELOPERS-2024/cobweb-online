export abstract class StateParameter {
    abstract getName(): string;
    abstract getValue(agent: any): any;
}
