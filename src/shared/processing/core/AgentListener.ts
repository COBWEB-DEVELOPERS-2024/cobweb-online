import { ControllerListener } from './ControllerListener.ts';
import { Agent } from './Agent.ts';
import { Location } from './Location.ts';
import { Cause } from './Cause.ts';

export abstract class AgentListener extends ControllerListener {
    abstract onContact(bumper: Agent, bumpee: Agent): void;
    abstract onStep(agent: Agent, from: Location, to: Location): void;
    abstract onSpawn(agent: Agent, parent1: Agent, parent2: Agent): void;
    abstract onSpawnSingle(agent: Agent, parent: Agent): void;
    abstract onSpawnSolo(agent: Agent): void;
    abstract onDeath(agent: Agent): void;
    abstract onConsumeFood(agent: Agent, foodType: number): void;
    abstract onConsumeAgent(agent: Agent, foodAgent: Agent): void;
    abstract onEnergyChange(agent: Agent, delta: number, cause: Cause): void;
    abstract onUpdate(agent: Agent): void;

    onTryStep(originalTo: Location): Location {
        return originalTo;
    }

    onNextMove(): boolean {
        return true;
    }
}
