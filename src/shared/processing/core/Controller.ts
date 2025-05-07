// src/core/Controller.ts

export abstract class Controller {
    abstract controlAgent(theAgent: any, inputCallback: Function): void;

    abstract createChildAsexual(): Controller;

    abstract createChildSexual(parent2: Controller): Controller;
}
