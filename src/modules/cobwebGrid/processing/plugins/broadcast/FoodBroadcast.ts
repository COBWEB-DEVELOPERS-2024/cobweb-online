import { BroadcastPacket } from "./BroadcastPacket";
import { Location } from "../../../../../shared/processing/core/Location.ts";
import { ComplexAgent } from "../../ComplexAgent";

export class FoodBroadcast extends BroadcastPacket {
    foodLocation: Location;

    constructor(foodLocation: Location, dispatcher: ComplexAgent) {
        super(dispatcher);
        this.foodLocation = foodLocation;
    }

    process(receiver: ComplexAgent): void {
        let closeness = 1;
        const pos = receiver.getPosition();
        if (pos !== null && !this.foodLocation.equals(pos)) {
            let recieverPosition = receiver.getPosition();
            if (receiver.environment.topology && recieverPosition) {
                closeness = 1 / receiver.environment.topology.getDistance(recieverPosition, this.foodLocation);
            }
        }
        receiver.setCommInbox(closeness);
    }
}
