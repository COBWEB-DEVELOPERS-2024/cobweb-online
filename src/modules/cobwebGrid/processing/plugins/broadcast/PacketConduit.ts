import { BroadcastPacket } from "./BroadcastPacket";
import { ComplexAgent } from "../../ComplexAgent";
import { Topology } from "../../../../../shared/processing/core/Topology.ts";
import { Location } from "../../../../../shared/processing/core/Location.ts";
import {LocationDirection} from "../../../../../shared/processing/core/LocationDirection.ts";

export function toLocation(locDir: LocationDirection | null): Location | null {
    if (!locDir) return null;
    return new Location(locDir.x, locDir.y);
}


export class PacketConduit {
    private broadcastBlocked: boolean;
    private currentPackets: BroadcastPacket[];
    private topology: Topology | null;

    constructor() {
        this.broadcastBlocked = false;
        this.currentPackets = [];
        this.topology = null;
    }

    setParams(topo: Topology): void {
        this.topology = topo;
    }

    addPacketToList(packet: BroadcastPacket): void {
        if (!this.broadcastBlocked) {
            this.currentPackets.push(packet);
            this.blockBroadcast();
        }
    }

    blockBroadcast(): void {
        this.broadcastBlocked = true;
    }

    unblockBroadcast(): void {
        this.broadcastBlocked = false;
    }

    clearPackets(): void {
        this.currentPackets = [];
    }

    decrementPersistence(): void {
        this.currentPackets = this.currentPackets.filter(packet => packet.updateCheckActive());
    }

    findPacket(position: Location, receiver: ComplexAgent): BroadcastPacket | null {
        if (!this.topology) return null;

        for (const commPacket of this.currentPackets) {
            const pos1: LocationDirection | null = position ? new LocationDirection(position) : null;
            const pos2 = toLocation(commPacket.location);
            if (pos1 && pos2) {
                const distance = this.topology.getDistance(pos1, pos2);
                const sender = commPacket.sender;

            if (
                distance < commPacket.range &&
                sender !== receiver &&
                (!sender.params.broadcastSameTypeOnly || receiver.getType() === sender.getType()) &&
                (
                    sender.params.broadcastMinSimilarity === 0 ||
                    sender.calculateSimilarity(receiver) >= sender.params.broadcastMinSimilarity
                )
            ) {
                return commPacket;
            }}
        }
        return null;
    }

    update(): void {
        this.decrementPersistence();
        this.unblockBroadcast();
    }
}
