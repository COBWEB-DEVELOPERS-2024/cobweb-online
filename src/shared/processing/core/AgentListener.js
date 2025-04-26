import { ControllerListener } from './ControllerListener.js';

export class AgentListener extends ControllerListener {
    onContact(bumper, bumpee) {
        // Override as needed
    }

    onStep(agent, from, to) {
        // Override as needed
    }

    onSpawn(agent, parent1, parent2) {
        // Override as needed
    }

    onSpawnSingle(agent, parent) {
        // Override as needed
    }

    onSpawnSolo(agent) {
        // Override as needed
    }

    onDeath(agent) {
        // Override as needed
    }

    onConsumeFood(agent, foodType) {
        // Override as needed
    }

    onConsumeAgent(agent, foodAgent) {
        // Override as needed
    }

    onEnergyChange(agent, delta, cause) {
        // Override as needed
    }

    onUpdate(agent) {
        // Override as needed
    }

    onTryStep(agent, from, originalTo) {
        return originalTo;
    }

    onNextMove(agent) {
        return true;
    }
}
