import { Location } from './Location.js';
import { LocationDirection } from './LocationDirection.js';
import { Direction } from './Direction.js';
import { Rotation } from './Rotation.js';

export class Topology {
    constructor(randomSource, width, height, wrap) {
        this.randomSource = randomSource;
        this.width = width;
        this.height = height;
        this.wrap = wrap;
    }

    getAdjacent(locationDirection) {
        let x = locationDirection.x + locationDirection.direction.x;
        let y = locationDirection.y + locationDirection.direction.y;

        if (this.wrap) {
            x = (x + this.width) % this.width;
            y = (y + this.height) % this.height;
        } else {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height)
                return null;
        }
        return new LocationDirection(new Location(x, y), locationDirection.direction);
    }

    getDistance(from, to) {
        return Math.sqrt(this.getDistanceSquared(from, to));
    }

    getDistanceSquared(from, to) {
        return this.simpleDistanceSquared(from, this.getClosestWrapLocation(from, to));
    }

    simpleDistanceSquared(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        return dx * dx + dy * dy;
    }

    getRandomLocation() {
        let l;
        do {
            l = new Location(
                this.randomSource.getRandom().nextInt(this.width),
                this.randomSource.getRandom().nextInt(this.height)
            );
        } while (!this.isValidLocation(l));
        return l;
    }

    isValidLocation(l) {
        return l && l.x >= 0 && l.x < this.width && l.y >= 0 && l.y < this.height;
    }

    getClosestWrapLocation(zero, target) {
        if (!this.wrap) return target;

        let best = target;
        let bestDist = this.simpleDistanceSquared(zero, target);

        for (const virtual of this.getWrapVirtualLocations(target)) {
            const dist = this.simpleDistanceSquared(zero, virtual);
            if (dist < bestDist) {
                best = virtual;
                bestDist = dist;
            }
        }
        return best;
    }

    getWrapVirtualLocations(l) {
        const result = [l];
        if (this.wrap) {
            result.push(new Location(l.x - this.width, l.y));
            result.push(new Location(l.x + this.width, l.y));
            result.push(new Location(l.x - this.width + this.width / 2, 2 * this.height - l.y - 1));
            result.push(new Location(l.x + this.width / 2, 2 * this.height - l.y - 1));
            result.push(new Location(l.x - this.width + this.width / 2, -l.y - 1));
            result.push(new Location(l.x + this.width / 2, -l.y - 1));
        }
        return result;
    }

    getArea(center, radius) {
        const result = new Set();
        const rSquared = radius * radius;

        if (!this.wrap) {
            for (let x = Math.max(0, center.x - radius); x <= Math.min(this.width - 1, center.x + radius); x++) {
                for (let y = Math.max(0, center.y - radius); y <= Math.min(this.height - 1, center.y + radius); y++) {
                    const l = new Location(x, y);
                    if (this.getDistanceSquared(center, l) <= rSquared)
                        result.add(l);
                }
            }
        } else {
            // Wrapping logic (we can add later if needed)
        }

        return result;
    }

    getTurnRightPosition(location) {
        return new LocationDirection(location, this.turnRight(location.direction));
    }

    getTurnLeftPosition(location) {
        return new LocationDirection(location, this.turnLeft(location.direction));
    }

    turnRight(dir) {
        return new Direction(-dir.y, dir.x);
    }

    turnLeft(dir) {
        return new Direction(dir.y, -dir.x);
    }

    getRotationBetween(from, to) {
        if (from.equals(to))
            return Rotation.None;
        if (this.turnRight(from).equals(to))
            return Rotation.Right;
        if (this.turnLeft(from).equals(to))
            return Rotation.Left;
        return Rotation.UTurn;
    }

    getDirectionBetween4way(from, to) {
        to = this.getClosestWrapLocation(from, to);
        const deltaX = to.x - from.x;
        const deltaY = to.y - from.y;
        if (deltaX === 0 && deltaY === 0) return Topology.NONE;
        const angle = Math.atan2(deltaY, deltaX) / Math.PI * 4;
        if (angle >= -3 && angle < -1) return Topology.NORTH;
        if (angle >= -1 && angle < 1) return Topology.EAST;
        if (angle >= 1 && angle < 3) return Topology.SOUTH;
        return Topology.WEST;
    }
}

Topology.NONE = new Direction(0, 0);
Topology.NORTH = new Direction(0, -1);
Topology.EAST = new Direction(1, 0);
Topology.SOUTH = new Direction(0, 1);
Topology.WEST = new Direction(-1, 0);
Topology.NORTHEAST = new Direction(1, -1);
Topology.SOUTHEAST = new Direction(1, 1);
Topology.SOUTHWEST = new Direction(-1, 1);
Topology.NORTHWEST = new Direction(-1, -1);

Topology.ALL_4_WAY = [
    Topology.NORTH, Topology.EAST,
    Topology.SOUTH, Topology.WEST
];

Topology.ALL_8_WAY = [
    Topology.NORTH, Topology.EAST,
    Topology.SOUTH, Topology.WEST,
    Topology.NORTHEAST, Topology.SOUTHEAST,
    Topology.SOUTHWEST, Topology.NORTHWEST
];
