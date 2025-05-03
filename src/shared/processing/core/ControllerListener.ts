import { Agent } from './Agent.ts';
import { ControllerInput } from './ControllerInput.ts';

export abstract class ControllerListener {
    abstract beforeControl(agent: Agent, controllerInput: ControllerInput): void;
}
