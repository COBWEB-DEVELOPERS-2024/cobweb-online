import { Location } from './Location';
import { Topology } from './Topology';
import {Direction} from "./Direction.ts";

export class LocationDirection extends Location {
    direction: Direction;

    constructor(location: Location, direction: any = Topology.NONE) {
        super(location.x, location.y);
        this.direction = direction;
    }
}
