import { Simulation } from "../processing/Simulation.js";

export async function initCobwebSimulation(canvas) {
    console.log("🚀 Starting WebGPU Simulation test...");

    if (!navigator.gpu) {
        console.error("WebGPU is not supported on this browser.");
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    const simulation = new Simulation(device);
    await simulation.initialize();

    // Add agents
    for (let i = 0; i < 10; i++) {
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 64);
        simulation.addAgent({ x, y }, 0);
    }

    // Add food with integer positions
    for (let i = 0; i < 50; i++) {
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 64);
        simulation.addFood({ x, y }, 0);
    }

    // Upload agent data to GPU
    await simulation.uploadAgents();

    // Step and log each tick
    async function stepAndLog() {
        await simulation.step();
        const state = simulation.getSimulationState();
        console.log(` Step ${simulation.getTime()}`);
        console.log(" Agents:", state.agents);
        console.log(" Food:", state.food);
    }

    await stepAndLog(); // initial step
    setInterval(stepAndLog, 1000); // step every second
}
