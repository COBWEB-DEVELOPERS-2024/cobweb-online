
export interface ControllerInput<AgentType = unknown, ContextType = unknown> {
    /**
     * Mutate the controller input (e.g., during evolution)
     */
    mutate(adjustmentStrength: number): void;

    /**
     * Optional hook before control logic runs
     */
    beforeControl?(agent: AgentType, context: ContextType): void;
}
