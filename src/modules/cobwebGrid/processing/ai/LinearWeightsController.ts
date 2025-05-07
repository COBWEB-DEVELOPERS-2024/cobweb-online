import { ComplexAgent } from '../ComplexAgent';
import { Topology } from '../../../../shared/processing/core/Topology';
import { LinearWeightsControllerParams } from './LinearWeightsControllerParams.ts';
import { LinearWeightAgentParam } from './LinearWeightAgentParam.ts';

const ENERGY_THRESHOLD = 160;
const OUTPUT_VALUE_MAX = 100000;

export class LinearWeightsController {
    simulator: any;
    stats: LinearWeightsControllerParams;
    params: LinearWeightAgentParam;
    agentType: number;
    data: number[][];

    constructor(simulation: any, params: LinearWeightsControllerParams, agentType: number) {
        this.simulator = simulation;
        this.stats = params;
        this.agentType = agentType;
        this.params = params.agentParams[agentType];
        this.data = this.cloneArray(this.params.dataInitial);
    }

    private cloneArray(arr: number[][]): number[][] {
        return arr.map(row => [...row]);
    }

    private limitOutput(value: number): number {
        return Math.max(-OUTPUT_VALUE_MAX, Math.min(OUTPUT_VALUE_MAX, value));
    }

    controlAgent(agent: ComplexAgent, inputCallback: any): void {
        const get = agent.getState('VisionState').distanceLook();
        const type = get.getType();
        const dist = get.getDist();

        const variables: number[] = new Array(14 + this.simulator.getStatePluginKeys().length);
        variables[0] = 1.0;
        variables[1] = (agent.getEnergy() / ENERGY_THRESHOLD);
        variables[2] = type === 3 ? (get.getMaxDistance() - dist) / get.getMaxDistance() : 0;
        variables[3] = type === 2 ? (get.getMaxDistance() - dist) / get.getMaxDistance() : 0;
        variables[4] = (type === 1 || type === 4) ? ((get.getMaxDistance() - dist) / 4) : 0;
        variables[5] = this.simulator.getTopology()
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            .getRotationBetween(Topology.NORTH, agent.getPosition().direction)
            .ordinal() / 2.0;
        variables[6] = agent.getMemoryBuffer();
        variables[7] = agent.getCommInbox();
        variables[8] = Math.max(agent.getAge() / 100.0, 2);
        variables[9] = Math.random();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        variables[10] = agent.getPosition().direction.equals(Topology.NORTH) ? 1 : 0;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        variables[11] = agent.getPosition().direction.equals(Topology.EAST) ? 1 : 0;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        variables[12] = agent.getPosition().direction.equals(Topology.SOUTH) ? 1 : 0;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        variables[13] = agent.getPosition().direction.equals(Topology.WEST) ? 1 : 0;

        let i = 14;
        for (const plugin of this.simulator.getStatePluginKeys()) {
            const sp = this.simulator.getStateParameter(plugin);
            variables[i++] = sp.getValue(agent);
        }

        inputCallback.beforeControl(agent, { inputs: variables });

        const outputs: number[] = new Array(6).fill(0.0);

        for (let eq = 0; eq < outputs.length; eq++) {
            for (let v = 0; v < variables.length; v++) {
                outputs[eq] += this.data[v][eq] * variables[v];
            }
            outputs[eq] = this.limitOutput(outputs[eq]);
            this.stats.updateStats(eq, outputs[eq]);
        }

        agent.setMemoryBuffer(outputs[0]);
        agent.setCommOutbox(outputs[1]);
        agent.setShouldReproduceAsex(outputs[5] > 0.5);

        if (outputs[3] > outputs[2] && outputs[3] > outputs[4]) {
            agent.turnRight();
        } else if (outputs[2] > outputs[3] && outputs[2] > outputs[4]) {
            agent.turnLeft();
        } else if (outputs[4] > 0) {
            agent.step();
        }
    }

    mutate(mutationRate: number): void {
        let mutationCounter = this.data.length * this.data[0].length * mutationRate;
        while (mutationCounter > 1) {
            const i = Math.floor(Math.random() * this.data.length);
            const j = Math.floor(Math.random() * this.data[i].length);
            this.data[i][j] += (Math.random() - 0.5);
            mutationCounter -= 1;
        }
    }

    createChildAsexual(): LinearWeightsController {
        const child = new LinearWeightsController(this.simulator, this.stats, this.agentType);
        child.data = this.cloneArray(this.data);
        child.mutate(this.params.mutationRate);
        return child;
    }

    createChildSexual(p2: LinearWeightsController): LinearWeightsController {
        const parent2 = p2;
        const child = new LinearWeightsController(this.simulator, this.stats, this.agentType);
        child.data = this.cloneArray(this.data);
        for (let i = 0; i < child.data.length; i++) {
            for (let j = 0; j < child.data[i].length; j++) {
                if (Math.random() < 0.5) {
                    child.data[i][j] = parent2.data[i][j];
                }
            }
        }
        child.mutate(this.params.mutationRate);
        return child;
    }

    similarity(other: LinearWeightsController): number {
        let diff = 0;
        for (let i = 0; i < this.data.length; i++) {
            for (let j = 0; j < this.data[i].length; j++) {
                diff += Math.abs(this.data[i][j] ** 2 - other.data[i][j] ** 2);
            }
        }
        return Math.max(0, (100.0 - diff) / 100.0);
    }
}
