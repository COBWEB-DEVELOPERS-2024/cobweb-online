import { Simulation } from "../processing/Simulation.js";

export async function initCobwebSimulation(canvas) {
    console.log(" Starting WebGPU Simulation test...");

    if (!navigator.gpu) {
        console.error("WebGPU is not supported on this browser.");
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    const simulation = new Simulation(device);
    await simulation.initialize();

    for (let i = 0; i < 10; i++) {
        simulation.addAgent({ x: Math.random() * 64, y: Math.random() * 64 }, 0);
    }

    await simulation.uploadAgents();

    async function stepAndLog() {
        await simulation.step();
        console.log(` Step ${simulation.getTime()}:`, simulation.getAgentData());
    }

    await stepAndLog();
    setInterval(stepAndLog, 1000);
}

