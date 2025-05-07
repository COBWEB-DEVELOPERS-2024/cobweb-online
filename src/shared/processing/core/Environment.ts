import { Topology } from './Topology';
import { Location } from './Location';
import { Drop } from './Drop';
import { Updatable } from './Updatable';
import { Agent } from './Agent.ts';
import { EnvironmentMutator } from './EnvironmentMutator';

export class Environment extends Updatable {
    static FLAG_STONE = 1;
    static FLAG_FOOD = 2;
    static FLAG_AGENT = 3;
    static FLAG_DROP = 4;

    simulation: any;
    topology: Topology | null = null;
    agentTable: Map<string, Agent> = new Map();
    flagArray: number[][] = [];
    foodTypeArray: number[][] = [];
    dropArray: (Drop | null)[][] = [];

    constructor(simulation: any) {
        super();
        this.simulation = simulation;
    }

    load(width: number, height: number, wrap: boolean, keepOldArray: boolean): void {
        this.topology = new Topology(this.simulation, width, height, wrap);

        if (!keepOldArray) {
            this.flagArray = Array.from({ length: width }, () => Array.from({ length: height }, () => 0));
            this.foodTypeArray = Array.from({ length: width }, () => Array.from({ length: height }, () => 0));
            this.dropArray = Array.from({ length: width }, () => Array.from({ length: height }, () => null));
        }
    }

    plugins: Map<new (...args: any[]) => EnvironmentMutator, EnvironmentMutator> = new Map();

    getPlugin<T extends EnvironmentMutator>(type: new (...args: any[]) => T): T {
        return this.plugins.get(type) as T;
    }

    clearAgents(): void {
        for (const agent of this.getAgents()) {
            agent.die();
        }
        this.agentTable.clear();
    }

    getAgent(location: Location): Agent {
        return <Agent>this.agentTable.get(this._locKey(location));
    }

    getAgents(): any[] {
        return Array.from(this.agentTable.values());
    }

    getAgentCount(): number {
        return this.agentTable.size;
    }

    getClosestAgent(agent: any): any {
        const l1 = agent.getPosition();
        let closest: any = null;
        let closestDistance = Math.sqrt((this.topology!.width ** 2) + (this.topology!.height ** 2));

        for (const [locKey, otherAgent] of this.agentTable.entries()) {
            const loc = this._parseLocKey(locKey);
            const dist = this.topology!.getDistance(loc, l1);
            if (dist < closestDistance) {
                closest = otherAgent;
                closestDistance = dist;
            }
        }
        return closest;
    }

    setAgent(location: Location, agent: any): void {
        if (agent)
            this.agentTable.set(this._locKey(location), agent);
        else
            this.agentTable.delete(this._locKey(location));
    }

    private _locKey(location: Location): string {
        return `${location.x},${location.y}`;
    }

    private _parseLocKey(key: string): Location {
        const [x, y] = key.split(',').map(Number);
        return new Location(x, y);
    }

    getLocationBits(location: Location): number {
        return this.flagArray[location.x]?.[location.y] ?? 0;
    }

    setLocationBits(location: Location, bits: number): void {
        if (this.flagArray[location.x]) {
            this.flagArray[location.x][location.y] = bits;
        }
    }

    setFlag(location: Location, flag: number, state: boolean): void {
        const flagBits = 1 << (flag - 1);
        let newValue = this.getLocationBits(location);

        if (state)
            newValue |= flagBits;
        else
            newValue &= ~flagBits;

        this.setLocationBits(location, newValue);
    }

    testFlag(location: Location, flag: number): boolean {
        const flagBits = 1 << (flag - 1);
        return (this.getLocationBits(location) & flagBits) !== 0;
    }

    getFoodType(location: Location): number {
        return this.foodTypeArray[location.x]?.[location.y] ?? 0;
    }

    addFood(location: Location, type: number): void {
        if (this.hasStone(location)) {
            throw new Error("stone here already");
        }

        // Safety: Ensure target cell is initialized
        if (!this.foodTypeArray[location.x]) {
            console.warn(`foodTypeArray[${location.x}] not initialized`);
            return;
        }

        if (location.y >= this.foodTypeArray[location.x].length) {
            console.warn(`Y index ${location.y} out of bounds for foodTypeArray[${location.x}]`);
            return;
        }

        this.setFlag(location, Environment.FLAG_FOOD, true);
        this.foodTypeArray[location.x][location.y] = type;
    }


    clearFood(): void {
        this.clearFlag(Environment.FLAG_FOOD);
    }

    removeFood(location: Location): void {
        this.setFlag(location, Environment.FLAG_FOOD, false);
    }

    hasFood(location: Location): boolean {
        return this.testFlag(location, Environment.FLAG_FOOD);
    }

    clearFlag(flag: number): void {
        for (let x = 0; x < this.topology!.width; ++x) {
            for (let y = 0; y < this.topology!.height; ++y) {
                const loc = new Location(x, y);
                if (this.testFlag(loc, flag)) {
                    if (flag === Environment.FLAG_DROP) {
                        this.removeDrop(loc);
                    } else {
                        this.setFlag(loc, flag, false);
                    }
                }
            }
        }
    }

    addStone(location: Location): void {
        if (this.hasAgent(location)) return;
        if (this.hasFood(location)) this.removeFood(location);
        if (this.testFlag(location, Environment.FLAG_DROP)) this.setFlag(location, Environment.FLAG_DROP, false);
        this.setFlag(location, Environment.FLAG_STONE, true);
    }

    clearStones(): void {
        this.clearFlag(Environment.FLAG_STONE);
    }

    hasAnythingAt(location: Location): boolean {
        return this.getLocationBits(location) !== 0 || this.hasAgent(location);
    }

    removeStone(location: Location): void {
        this.setFlag(location, Environment.FLAG_STONE, false);
    }

    addDrop(location: Location, drop: Drop): void {
        if (this.hasFood(location)) {
            this.removeFood(location);
        }
        this.setFlag(location, Environment.FLAG_DROP, true);
        this.dropArray[location.x][location.y] = drop;
    }

    removeDrop(location: Location): void {
        if (this.hasDrop(location)) {
            const drop = this.dropArray[location.x][location.y];
            drop?.prepareRemove();
            this.setFlag(location, Environment.FLAG_DROP, false);
            this.dropArray[location.x][location.y] = null;
        }
    }

    getDrop(location: Location): Drop | null {
        return this.dropArray[location.x]?.[location.y] ?? null;
    }

    hasDrop(location: Location): boolean {
        return this.testFlag(location, Environment.FLAG_DROP);
    }

    hasStone(location: Location): boolean {
        return this.testFlag(location, Environment.FLAG_STONE);
    }

    hasAgent(location: Location): boolean {
        return this.getAgent(location) != null;
    }

    clearDrops(): void {
        this.clearFlag(Environment.FLAG_DROP);
    }

    killOffgridAgents(): void {
        for (const agent of this.getAgents()) {
            const loc = agent.getPosition();
            if (loc.x >= this.topology!.width || loc.y >= this.topology!.height) {
                agent.die();
            }
        }
    }

    removeAgent(location: Location): void {
        const agent = this.getAgent(location);
        if (agent) agent.die();
    }

    update(): void {
        // No-op
    }
}
