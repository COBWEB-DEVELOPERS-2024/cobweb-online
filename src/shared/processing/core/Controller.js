export class Controller {
    controlAgent(theAgent, inputCallback) {
        throw new Error('controlAgent must be implemented');
    }

    createChildAsexual() {
        throw new Error('createChildAsexual must be implemented');
    }

    createChildSexual(parent2) {
        throw new Error('createChildSexual must be implemented');
    }
}
