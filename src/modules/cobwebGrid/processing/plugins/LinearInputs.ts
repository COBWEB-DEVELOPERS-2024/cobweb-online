import { ControllerInput } from '../../../../shared/processing/core/ControllerInput';

export class LinearInput implements ControllerInput {
    weight: number;

    constructor(weight: number = Math.random()) {
        this.weight = weight;
    }

    mutate(adjustmentStrength: number): void {
        const delta = (Math.random() * 2 - 1) * adjustmentStrength;
        this.weight += delta;
    }

    copy(): LinearInput {
        return new LinearInput(this.weight);
    }

    static crossover(inputA: LinearInput, inputB: LinearInput): LinearInput {
        const chosenWeight = Math.random() < 0.5 ? inputA.weight : inputB.weight;
        return new LinearInput(chosenWeight);
    }
}
