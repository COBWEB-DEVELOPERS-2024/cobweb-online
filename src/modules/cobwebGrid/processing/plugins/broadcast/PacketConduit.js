export class PacketConduit {
    constructor() {
        this.broadcastBlocked = false;
        this.currentPackets = [];
        this.topology = null;
    }

    setParams(topo) {
        this.topology = topo;
    }

    addPacketToList(packet) {
        if (!this.broadcastBlocked) {
            this.currentPackets.push(packet);
            this.blockBroadcast();
        }
    }

    blockBroadcast() {
        this.broadcastBlocked = true;
    }

    unblockBroadcast() {
        this.broadcastBlocked = false;
    }

    clearPackets() {
        this.currentPackets = [];
    }

    decrementPersistence() {
        this.currentPackets = this.currentPackets.filter(packet => packet.updateCheckActive());
    }

    findPacket(position, receiver) {
        for (const commPacket of this.currentPackets) {
            const distance = this.topology.getDistance(position, commPacket.location);
            const sender = commPacket.sender;

            if (distance < commPacket.range &&
                sender !== receiver &&
                (!sender.params.broadcastSameTypeOnly || receiver.getType() === sender.getType()) &&
                (sender.params.broadcastMinSimilarity.getValue() === 0 || sender.calculateSimilarity(receiver) >= sender.params.broadcastMinSimilarity.getValue())) {
                return commPacket;
            }
        }
        return null;
    }

    update() {
        this.decrementPersistence();
        this.unblockBroadcast();
    }
}