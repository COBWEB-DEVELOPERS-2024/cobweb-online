// Interface for controller parameters
export class ControllerParams {
    /**
     * @param {SimulationInternals} sim - Simulation instance
     * @param {number} type - Agent type
     * @returns {Controller}
     */
    createController(sim, type) {
        throw new Error("createController must be implemented by subclass!");
    }

    /**
     * @param {AgentFoodCountable} envParams
     */
    resize(envParams) {
        throw new Error("resize must be implemented by subclass!");
    }
}
