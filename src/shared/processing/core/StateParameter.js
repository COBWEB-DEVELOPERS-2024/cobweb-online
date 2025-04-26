export class StateParameter {
    getName() {
        throw new Error('getName must be implemented');
    }

    getValue(agent) {
        throw new Error('getValue must be implemented');
    }
}
