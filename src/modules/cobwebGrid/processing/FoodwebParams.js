export class FoodwebParams {
    constructor(env) {
        this.canEatAgent = [];
        this.canEatFood = [];
        this.resize(env);
    }

    resize(env) {
        const typeCount = env.getAgentTypes();

        // Ensure canEatAgent size
        this.canEatAgent = [...(this.canEatAgent || [])];
        while (this.canEatAgent.length < typeCount) {
            this.canEatAgent.push(false);
        }
        if (this.canEatAgent.length > typeCount) {
            this.canEatAgent = this.canEatAgent.slice(0, typeCount);
        }

        // Ensure canEatFood size
        this.canEatFood = [...(this.canEatFood || [])];
        while (this.canEatFood.length < typeCount) {
            this.canEatFood.push(true);
            // By default, can eat food
        }
        if (this.canEatFood.length > typeCount) {
            this.canEatFood = this.canEatFood.slice(0, typeCount);
        }
    }

    clone() {
        const clone = new FoodwebParams({
            getAgentTypes: () => this.canEatAgent.length
        });
        clone.canEatAgent = [...this.canEatAgent];
        clone.canEatFood = [...this.canEatFood];
        return clone;
    }
}