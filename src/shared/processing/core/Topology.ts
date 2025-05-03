import { Location } from './Location';
import { LocationDirection } from './LocationDirection';
import { Direction } from './Direction';
import { Rotation } from './Rotation';

export class Topology {
    width: number;
    height: number;
    wrap: boolean;
    randomSource: any;

    constructor(randomSource: any, width: number, height: number, wrap: boolean) {
        this.randomSource = randomSource;
        this.width = width;
        this.height = height;
        this.wrap = wrap;
    }

    getAdjacent(locationDirection: LocationDirection): LocationDirection | null {
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

    getDistance(from: Location, to: Location): number {
        return Math.sqrt(this.getDistanceSquared(from, to));
    }

    getDistanceSquared(from: Location, to: Location): number {
        return this.simpleDistanceSquared(from, this.getClosestWrapLocation(from, to));
    }

    simpleDistanceSquared(from: Location, to: Location): number {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        return dx * dx + dy * dy;
    }

    getRandomLocation(): Location {
        let l: Location;
        do {
            l = new Location(
                Math.floor(this.randomSource.getRandom() * this.width),
                Math.floor(this.randomSource.getRandom() * this.height)
            );
        } while (!this.isValidLocation(l));
        return l;
    }

    isValidLocation(l: Location): boolean {
        return l && l.x >= 0 && l.x < this.width && l.y >= 0 && l.y < this.height;
    }

    getClosestWrapLocation(zero: Location, target: Location): Location {
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

    getWrapVirtualLocations(l: Location): Location[] {
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

    getArea(center: Location, radius: number): Set<Location> {
        const result = new Set<Location>();
        const rSquared = radius * radius;

        if (!this.wrap) {
            for (let x = Math.max(0, center.x - radius); x <= Math.min(this.width - 1, center.x + radius); x++) {
                for (let y = Math.max(0, center.y - radius); y <= Math.min(this.height - 1, center.y + radius); y++) {
                    const l = new Location(x, y);
                    if (this.getDistanceSquared(center, l) <= rSquared)
                        result.add(l);
                }
            }
        }
        return result;
    }

    getTurnRightPosition(location: LocationDirection): LocationDirection {
        return new LocationDirection(location, this.turnRight(location.direction));
    }

    getTurnLeftPosition(location: LocationDirection): LocationDirection {
        return new LocationDirection(location, this.turnLeft(location.direction));
    }

    turnRight(dir: Direction): Direction {
        return new Direction(-dir.y, dir.x);
    }

    turnLeft(dir: Direction): Direction {
        return new Direction(dir.y, -dir.x);
    }

    getRotationBetween(from: Direction, to: Direction): Rotation {
        if (from.equals(to)) return Rotation.None;
        if (this.turnRight(from).equals(to)) return Rotation.Right;
        if (this.turnLeft(from).equals(to)) return Rotation.Left;
        return Rotation.UTurn;
    }

    getDirectionBetween4way(from: Location, to: Location): Direction {
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

    static NONE = new Direction(0, 0);
    static NORTH = new Direction(0, -1);
    static EAST = new Direction(1, 0);
    static SOUTH = new Direction(0, 1);
    static WEST = new Direction(-1, 0);
    static NORTHEAST = new Direction(1, -1);
    static SOUTHEAST = new Direction(1, 1);
    static SOUTHWEST = new Direction(-1, 1);
    static NORTHWEST = new Direction(-1, -1);

    static ALL_4_WAY = [
        Topology.NORTH, Topology.EAST,
        Topology.SOUTH, Topology.WEST
    ];

    static ALL_8_WAY = [
        Topology.NORTH, Topology.EAST,
        Topology.SOUTH, Topology.WEST,
        Topology.NORTHEAST, Topology.SOUTHEAST,
        Topology.SOUTHWEST, Topology.NORTHWEST
    ];
}
