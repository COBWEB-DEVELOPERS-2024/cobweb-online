// You may want to replace `any` with more specific types if available in your project
export abstract class ControllerParams {
    /**
     * Creates a new controller for an agent.
     * @param sim - Simulation instance
     * @param type - Agent type
     */
    abstract createController(sim: any, type: number): any;

    /**
     * Resizes the environment parameter structure.
     * @param envParams - Parameters for food/agent/environment logic
     */
    abstract resize(envParams: any): void;
}
