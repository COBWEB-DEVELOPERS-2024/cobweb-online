import { Location } from './Location.js';
import { Topology } from './Topology.js';

export class LocationDirection extends Location {
    constructor(location, direction = Topology.NONE) {
        super(location.x, location.y);
        this.direction = direction;
    }
}
