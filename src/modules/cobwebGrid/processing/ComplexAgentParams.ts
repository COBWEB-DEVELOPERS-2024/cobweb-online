import { FoodwebParams } from './FoodwebParams';

export class ComplexAgentParams {
    initialAgents = 20;
    foodEnergy = 100;
    otherFoodEnergy = 25;
    agentFoodEnergy = 1.0;
    breedEnergy = 60;
    asexPregnancyPeriod = 0;
    initEnergy = 100;
    stepEnergy = 1;
    stepRockEnergy = 2;
    stepAgentEnergy = 2;
    turnRightEnergy = 1;
    turnLeftEnergy = 1;
    mutationRate = 0.05;
    commSimMin = 0;
    sexualBreedChance = 1.0;
    asexualBreedChance = 0;
    breedSimMin = 0;
    sexualPregnancyPeriod = 5;
    agingMode = false;
    agingLimit = 300;
    agingRate = 10;
    pdMemory = 10;
    broadcastMode = false;
    broadcastEnergyBased = false;
    broadcastFixedRange = 20;
    broadcastEnergyMin = 20;
    broadcastEnergyCost = 5;
    broadcastSameTypeOnly = false;
    broadcastMinSimilarity = 0;
    partnerType = -1;
    poop = -1;
    childType = -1;
    probGiveBirthToOtherType = 0;

    foodweb: FoodwebParams;

    constructor(env: { getAgentTypes: () => number }) {
        this.foodweb = new FoodwebParams(env);
    }

    clone(): ComplexAgentParams {
        const clone = new ComplexAgentParams({
            getAgentTypes: () => this.foodweb.canEatAgent.length,
        });
        Object.assign(clone, this);
        clone.foodweb = this.foodweb.clone();
        return clone;
    }

    resize(env: { getAgentTypes: () => number }): void {
        this.foodweb?.resize(env);
    }
}
