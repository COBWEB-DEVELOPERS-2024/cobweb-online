import Simulation from '../processing/Simulation';

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
        simulation.addFood({ x, y }, Math.floor(Math.random() * 4));
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
    addRandomAgents(simulation, 10);
    addRandomFood(simulation, 50);

    // upload agents to simulation, return the simulation
    await simulation.uploadAgents();
    return simulation;
}

export async function stepCobwebSimulation(simulation: Simulation) {
    await simulation.step();
}

export function getAgentLocationRotationColors(simulation: Simulation): any {
    const agents = simulation.getAgentData();
    const agentLocations: number[][] = [];
    const agentRotations: number[] = [];
    const agentColors: number[] = [];

    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        agentLocations.push([agent.position.x, agent.position.y]);
        agentRotations.push(0);
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
        foodLocations.push([f.x, f.y]);
        foodColors.push(f.foodtype);
    }

    return [foodLocations, foodColors];
}
