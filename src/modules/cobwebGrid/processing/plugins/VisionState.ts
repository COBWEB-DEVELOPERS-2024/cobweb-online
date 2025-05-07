import { ComplexAgent } from "../ComplexAgent";
import { Environment } from "../../../../shared/processing/core/Environment";
import { LocationDirection } from "../../../../shared/processing/core/LocationDirection";
import { AgentState } from "./AgentState";
import { SeeInfo } from "./SeeInfo";

export class VisionState implements AgentState {
    private environment: Environment;
    private agent: ComplexAgent;

    public static readonly LOOK_DISTANCE = 4;

    constructor(environment: Environment, agent: ComplexAgent) {
        this.environment = environment;
        this.agent = agent;
    }

    distanceLook(): SeeInfo {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        let destPos: LocationDirection | null = this.environment.topology.getAdjacent(this.agent.getPosition());

        for (let dist = 1; dist <= VisionState.LOOK_DISTANCE; dist++) {
            if (!destPos)
                return new SeeInfo(dist, Environment.FLAG_STONE, VisionState.LOOK_DISTANCE);

            if (this.environment.hasStone(destPos))
                return new SeeInfo(dist, Environment.FLAG_STONE, VisionState.LOOK_DISTANCE);

            const occupant = this.environment.getAgent(destPos);
            if (occupant && occupant !== this.agent)
                return new SeeInfo(dist, Environment.FLAG_AGENT, VisionState.LOOK_DISTANCE);

            if (this.environment.hasFood(destPos))
                return new SeeInfo(dist, Environment.FLAG_FOOD, VisionState.LOOK_DISTANCE);

            if (this.environment.hasDrop(destPos))
                return new SeeInfo(dist, Environment.FLAG_DROP, VisionState.LOOK_DISTANCE);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            destPos = this.environment.topology.getAdjacent(destPos);
        }

        return new SeeInfo(VisionState.LOOK_DISTANCE);
    }

    getName(): string {
        return "VisionState";
    }

    getValue(): number {
        // Optional: return summary metric (not used in your logic directly)
        return 0;
    }

    isTransient(): boolean {
        return true;
    }
}
