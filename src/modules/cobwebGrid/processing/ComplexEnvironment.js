import { Environment } from "../core/Environment.js";
import { Location, LocationDirection } from "../core/Location.js";
import { ComplexAgent } from "./ComplexAgent.js";

export class ComplexEnvironment extends Environment {
    constructor(simulation) {
        super(simulation);

        this.agentData = [];
        this.data = null;
        this.plugins = new Map();
    }

    setParams(envParams, agentParams, keepOldAgents = false, keepOldArray = false, keepOldDrops = false) {
        this.data = envParams;
        this.agentData = agentParams.agentParams;

        super.load(this.data.width, this.data.height, this.data.wrapMap, keepOldArray);

        if (keepOldAgents) {
            this.killOffgridAgents();
            this.loadOldAgents();
        } else {
            this.agentTable.clear();
        }

        if (!keepOldDrops) {
            this.clearDrops();
        }
    }

    loadNew() {
        for (let i = 0; i < this.data.initialStones; i++) {
            let l, tries = 0;
            do {
                l = this.topology.getRandomLocation();
            } while (tries++ < 100 && (this.hasStone(l) || this.hasDrop(l) || this.hasAgent(l)));
            if (tries < 100)
                this.addStone(l);
        }

        for (const plugin of this.plugins.values()) {
            plugin.loadNew();
        }
    }

    loadNewAgents() {
        for (let i = 0; i < this.agentData.length; i++) {
            for (let j = 0; j < this.agentData[i].initialAgents; j++) {
                let loc, tries = 0;
                do {
                    loc = this.topology.getRandomLocation();
                } while (tries++ < 100 && (this.hasAgent(loc) || this.hasStone(loc) || this.hasDrop(loc)));
                if (tries < 100) {
                    this.spawnAgent(new LocationDirection(loc), i);
                }
            }
        }
    }

    addAgent(location, type = 0) {
        if (!this.hasAgent(location) && !this.hasStone(location) && !this.hasDrop(location)) {
            this.spawnAgent(new LocationDirection(location), type);
        }
    }

    spawnAgent(locationDir, agentType) {
        const agent = new ComplexAgent(this.simulation, agentType);
        const params = this.agentData[agentType];
        agent.init(this, locationDir, params, params.initEnergy.getValue());
        return agent;
    }

    addPlugin(plugin) {
        this.plugins.set(plugin.constructor, plugin);
    }

    getPlugin(type) {
        return this.plugins.get(type);
    }

    update() {
        super.update();
        this.updateDrops();
        for (const plugin of this.plugins.values()) {
            plugin.update();
        }
    }

    updateDrops() {
        for (let x = 0; x < this.topology.width; x++) {
            for (let y = 0; y < this.topology.height; y++) {
                const l = new Location(x, y);
                if (!this.hasDrop(l)) continue;
                const d = this.getDrop(l);
                d.update();
            }
        }
    }

    loadOldAgents() {
        for (let x = 0; x < this.topology.width; x++) {
            for (let y = 0; y < this.topology.height; y++) {
                const pos = new Location(x, y);
                const agent = this.getAgent(pos);
                if (agent) {
                    agent.setParams(this.agentData[agent.getType()]);
                }
            }
        }
    }
}
