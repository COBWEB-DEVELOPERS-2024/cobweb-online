
export class FoodwebParams {
    constructor(env) {
        this.canEatAgent = [];
        this.canEatFood = [];

        this.resize(env);
    }

    resize(envParams) {
        this.canEatAgent = [...(this.canEatAgent || [])];
        while (this.canEatAgent.length < envParams.getAgentTypes()) {
            this.canEatAgent.push(false);
        }
        if (this.canEatAgent.length > envParams.getAgentTypes()) {
            this.canEatAgent = this.canEatAgent.slice(0, envParams.getAgentTypes());
        }

        const oldSize = this.canEatFood.length;
        this.canEatFood = [...(this.canEatFood || [])];
        while (this.canEatFood.length < envParams.getAgentTypes()) {
            this.canEatFood.push(true); // Default behavior: agents can eat food
        }
        if (this.canEatFood.length > envParams.getAgentTypes()) {
            this.canEatFood = this.canEatFood.slice(0, envParams.getAgentTypes());
        }
    }
}
