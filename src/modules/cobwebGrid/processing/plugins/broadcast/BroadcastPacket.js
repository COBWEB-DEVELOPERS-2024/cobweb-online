export class BroadcastPacket {
    constructor(sender) {
        this.sender = sender;
        this.location = sender.getPosition();
        this.range = sender.params.broadcastFixedRange.getValue();
        if (sender.params.broadcastEnergyBased) {
            this.range = sender.getEnergy() / 10 + 1;
        }
        this.persistence = 3;
    }

    updateCheckActive() {
        this.persistence--;
        return this.persistence > 0;
    }

    process(receiver) {
        // Abstract; override in subclass
    }
}
