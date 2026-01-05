import { Environment } from "../../../shared/processing/core/Environment";
import { Location} from "../../../shared/processing/core/Location";
import { LocationDirection } from "../../../shared/processing/core/LocationDirection.ts";
import { ComplexAgent } from "./ComplexAgent";
import { EnvironmentMutator } from "../../../shared/processing/core/EnvironmentMutator.ts";
import { ComplexAgentParams } from "./ComplexAgentParams";
import { Waste } from "../../../shared/processing/core/Waste.ts";
import { Simulation } from "./Simulation.ts";

export class ComplexEnvironment extends Environment {
    agentData: ComplexAgentParams[] = [];
    data: ComplexEnvironmentParams | null = null;
    plugins: Map<new (...args: any[]) => EnvironmentMutator, EnvironmentMutator> = new Map();

    constructor(simulation: Simulation) {
        super(simulation);
    }

    setParams(
        envParams: ComplexEnvironmentParams,
        agentParams: { agentParams: ComplexAgentParams[] },
        keepOldAgents = false,
        keepOldArray = false,
        keepOldWaste = false
    ): void {
        this.data = envParams;
        this.agentData = agentParams.agentParams;
        super.load(this.data.width, this.data.height, this.data.wrapMap, keepOldArray);

        if (keepOldAgents) {
            this.killOffgridAgents();
            this.loadOldAgents();
        } else {
            this.agentTable.clear();
        }

        if (!keepOldWaste) {
            this.clearWaste();
        }
    }

    loadNew(): void {
        if (!this.data) return;
        for (let i = 0; i < this.data.initialStones; i++) {
            let l: Location;
            let tries = 0;
            do {
                l = this.topology!.getRandomLocation();
            } while (tries++ < 100 && (this.hasStone(l) || this.hasWaste(l) || this.hasAgent(l)));
            if (tries < 100) this.addStone(l);
        }

        for (const plugin of this.plugins.values()) {
            plugin.loadNew();
        }
    }

    loadNewAgents(): void {
        for (let i = 0; i < this.agentData.length; i++) {
            for (let j = 0; j < this.agentData[i].initialAgents; j++) {
                let loc: Location;
                let tries = 0;
                do {
                    loc = this.topology!.getRandomLocation();
                } while (tries++ < 100 && (this.hasAgent(loc) || this.hasStone(loc) || this.hasWaste(loc)));
                if (tries < 100) {
                    this.spawnAgent(new LocationDirection(loc), i);
                }
            }
        }
    }

    addAgent(location: Location, type = 0): void {
        if (!this.hasAgent(location) && !this.hasStone(location) && !this.hasWaste(location)) {
            this.spawnAgent(new LocationDirection(location), type);
        }
    }

    spawnAgent(locationDir: LocationDirection, agentType: number): ComplexAgent {
        const agent = new ComplexAgent(this.simulation, agentType);
        const params = this.agentData[agentType];
        agent.init(this, locationDir, params, params.initEnergy);
        return agent;
    }

    addPlugin<T extends EnvironmentMutator>(plugin: T): void {
        this.plugins.set(plugin.constructor as new (...args: any[]) => EnvironmentMutator, plugin);
    }

    getPlugin<T extends EnvironmentMutator>(type: new (...args: any[]) => EnvironmentMutator): T {
        return this.plugins.get(type) as T;
    }

    override update(): void {
        super.update();
        this.updateWaste();
        for (const plugin of this.plugins.values()) {
            plugin.update();
        }
    }

    updateWaste(): void {
        for (let x = 0; x < this.topology!.width; x++) {
            for (let y = 0; y < this.topology!.height; y++) {
                const l = new Location(x, y);
                if (!this.hasWaste(l)) continue;
                const d: Waste | null = this.getWaste(l);
                d?.update();
            }
        }
    }

    loadOldAgents(): void {
        for (let x = 0; x < this.topology!.width; x++) {
            for (let y = 0; y < this.topology!.height; y++) {
                const pos = new Location(x, y);
                const agent = this.getAgent(pos) as ComplexAgent;
                if (agent) {
                    agent.params = this.agentData[agent.getType()];
                }
            }
        }
    }
}

export class ComplexEnvironmentParams {
    width: number = 80;
    height: number = 80;
    wrapMap: boolean = true;
    initialStones: number = 10;
}

export abstract class ControllerParams {
    abstract createController(sim: any, type: number): any;
    abstract resize(envParams: any): void;
}

export class GridCellSizer {
    static findBestCellSize(gridWidth: number, gridHeight: number, canvasWidth: number, canvasHeight: number): number {
        const cellWidth = canvasWidth / gridWidth;
        const cellHeight = canvasHeight / gridHeight;
        return Math.min(cellWidth, cellHeight);
    }
}
