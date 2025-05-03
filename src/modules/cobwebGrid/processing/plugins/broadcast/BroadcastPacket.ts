import { ComplexAgent } from "../../ComplexAgent";
import {LocationDirection} from "../../../../../shared/processing/core/LocationDirection.ts";

export abstract class BroadcastPacket {
    sender: ComplexAgent;
    location: LocationDirection | null;
    range: number;
    persistence: number;

    constructor(sender: ComplexAgent) {
        this.sender = sender;
        this.location = sender.getPosition();
        this.range = sender.params.broadcastFixedRange;
        if (sender.params.broadcastEnergyBased) {
            this.range = sender.getEnergy() / 10 + 1;
        }
        this.persistence = 3;
    }

    updateCheckActive(): boolean {
        this.persistence--;
        return this.persistence > 0;
    }

    abstract process(receiver: ComplexAgent): void;
}
