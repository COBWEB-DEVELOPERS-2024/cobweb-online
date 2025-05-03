import { StatePluginSource } from './StatePluginSource';
import { AgentSimilarityCalculator } from './AgentSimilarityCalculator';
import { AgentListener } from './AgentListener';
import {Agent} from "./Agent.ts";
import {StateParameter} from "./StateParameter.ts";

export abstract class SimulationInternals extends StatePluginSource {
    abstract newAgent(type: number): Agent;
    abstract addAgent(agent: Agent): void;
    abstract getStateParameter(name: string): StateParameter;
    abstract getSimilarityCalculator(): AgentSimilarityCalculator;
    abstract getAgentListener(): AgentListener;
}
