
import { BroadcastPacket } from "./BroadcastPacket.js";

export class FoodBroadcast extends BroadcastPacket {
    constructor(foodLocation, dispatcherId) {
        super(dispatcherId);
        this.foodLocation = foodLocation;
    }

    process(receiver) {
        let closeness = 1;
        if (!this.foodLocation.equals(receiver.getPosition())) {
            closeness = 1 / receiver.environment.topology.getDistance(receiver.getPosition(), this.foodLocation);
        }
        receiver.setCommInbox(closeness);
    }
}