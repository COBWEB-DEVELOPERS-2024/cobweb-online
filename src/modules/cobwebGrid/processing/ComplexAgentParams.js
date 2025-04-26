import { FoodwebParams } from "./FoodwebParams.js";

export class ComplexAgentParams {
    constructor(env) {
        this.initialAgents = 20;
        this.foodEnergy = 100;
        this.otherFoodEnergy = 25;
        this.agentFoodEnergy = 1.0;
        this.breedEnergy = 60;
        this.asexPregnancyPeriod = 0;
        this.initEnergy = 100;
        this.stepEnergy = 1;
        this.stepRockEnergy = 2;
        this.stepAgentEnergy = 2;
        this.turnRightEnergy = 1;
        this.turnLeftEnergy = 1;
        this.mutationRate = 0.05;
        this.commSimMin = 0;
        this.sexualBreedChance = 1.0;
        this.asexualBreedChance = 0;
        this.breedSimMin = 0;
        this.sexualPregnancyPeriod = 5;
        this.agingMode = false;
        this.agingLimit = 300;
        this.agingRate = 10;
        this.pdMemory = 10;
        this.broadcastMode = false;
        this.broadcastEnergyBased = false;
        this.broadcastFixedRange = 20;
        this.broadcastEnergyMin = 20;
        this.broadcastEnergyCost = 5;
        this.broadcastSameTypeOnly = false;
        this.broadcastMinSimilarity = 0;
        this.partnerType = -1;
        this.poop = -1;
        this.childType = -1;
        this.probGiveBirthToOtherType = 0;
        this.foodweb = new FoodwebParams(env);
    }

    clone() {
        const clone = new ComplexAgentParams(null);
        Object.assign(clone, this);
        clone.foodweb = this.foodweb.clone();
        return clone;
    }

    resize(env) {
        if (this.foodweb) {
            this.foodweb.resize(env);
        }
    }
}
