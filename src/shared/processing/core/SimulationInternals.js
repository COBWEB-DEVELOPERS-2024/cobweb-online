import { StatePluginSource } from './StatePluginSource.js';
import { SimulationTimeSpace } from './SimulationTimeSpace.js';
import { AgentSimilarityCalculator } from './AgentSimilarityCalculator.js';
import { AgentListener } from './AgentListener.js';

export class SimulationInternals extends StatePluginSource {
    newAgent(type) {
        throw new Error('newAgent must be implemented');
    }

    addAgent(agent) {
        throw new Error('addAgent must be implemented');
    }

    getStateParameter(name) {
        throw new Error('getStateParameter must be implemented');
    }

    getSimilarityCalculator() {
        throw new Error('getSimilarityCalculator must be implemented');
    }

    getAgentListener() {
        throw new Error('getAgentListener must be implemented');
    }
}
