import { Agent } from '../../../shared/processing/core/Agent';
import { Simulation } from '../processing/Simulation';

function addRandomAgents(simulation: any, amount: number) {
    for (let i = 0; i < amount; i++) {
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 64);
        simulation.addAgent({ x, y }, Math.floor(Math.random() * 4));
    }
}

function addRandomFood(simulation: any, amount: number) {
    for (let i = 0; i < amount; i++) {
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 64);
        simulation.addFood({ x, y },  Math.floor(Math.random() * 4));
    }
}

export async function randomCobwebInit(): Promise<any> {
    // get gpu device info
    if (!navigator.gpu) throw new Error('WebGPU not supported');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('No GPU adapter');
    const device = await adapter.requestDevice();

    // initialize simulation
    const simulation = new Simulation(device);
    await simulation.initialize();

    // populate with random agents and food
    addRandomAgents(simulation, 50);
    addRandomFood(simulation, 50);

    // upload agents to simulation, return the simulation
    await simulation.uploadAgents();
    await simulation.environment.uploadFoodToGPU();
    return simulation;
}

export async function stepCobwebSimulation(simulation: Simulation) {
    await simulation.step();
    console.log(simulation.getSimulationState())
}

function getAgentRotation(agent: Agent): number {
    switch (agent.position?.direction.x) {
        case -1:
            return 3;
        case 1:
            return 1;
        case 0:
            switch (agent.position?.direction.y) {
                case -1:
                    return 0;
                case 1:
                    return 2;
                default:
                    return 0;
            }
        default:
            return 0;
    }
}

export function getAgentLocationRotationColors(simulation: Simulation): any {
    const agents = simulation.getAgentData();
    const agentLocations: number[][] = [];
    const agentRotations: number[] = [];
    const agentColors: number[] = [];

    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        if (agent.position === null || agent.position.x < 0 || agent.position.y < 0) continue;      // skip agent if agent position is null or out of bounds
        agentLocations.push([agent.position.x, agent.position.y]);
        agentRotations.push(getAgentRotation(agent));
        agentColors.push(agent.type);
    }

    return [agentLocations, agentRotations, agentColors];
}

export function getFoodLocationColors(simulation: Simulation): any {
    const food = simulation.getFoodData();
    const foodLocations: number[][] = [];
    const foodColors: number[] = [];

    for (let i = 0; i < food.length; i++) {
        const f = food[i];

        if (f.x < 0 || f.y < 0 || f.foodType === -9999 || f.foodType === 9999 || f.foodType === undefined) continue;

        foodLocations.push([f.x, f.y]);
        foodColors.push(f.foodType);
    }

    return [foodLocations, foodColors];
}

