# cobweb-online
COBWEB is an agent-based simulation environment used by over 100 students every year for research in ecology, economics, and more. This version of COBWEB is available online and is primarily made with TypeScript, JavaScript, React, and WebGPU.
Got it! Here's your clean and professional `README.md` for **CobwebOnline**, written in GitHub-flavored Markdown **without emojis**, and tailored to reflect that this project is both the frontend and backend combined:



## About Cobweb Online

**Cobweb Online** is a browser-based agent simulation system powered by **WebGPU**, allowing real-time, GPU-accelerated simulations and interactive visualizations. It is a modern web re-implementation of the original Java-based COBWEB simulator, now split across a JavaScript backend (modular simulation logic) and a TypeScript/React frontend (interactive interface and rendering). 


## Key Features

- Real-time agent-based simulation using WebGPU compute shaders
- Visualization of agents, food, and environment using WebGPU fragment shaders
- Modular backend for simulation logic in JavaScript
- TypeScript-based frontend with Vite + React
- Asexual and sexual reproduction, food consumption, energy decay, aging and death
- Obstacles ("stones") that block movement
- Fully in-browser, no backend server required

---

## System Architecture Overview

### Frontend (TypeScript + Vite + React)

- `App.tsx`: Entry point for rendering the app
- `WebGPUCanvas.tsx`: Renders the simulation grid using `cobwebGridShader.wgsl`
- `stepCobwebSimulation.ts`: Triggers compute passes each frame
- `randomCobwebInit.ts`: Initializes the starting simulation state
- `webgpuCobwebGrid.ts`: Sets up GPU buffers, pipelines, and drawing logic

### Backend (JavaScript Modules)

Located under `src/shared/processing/` and `src/modules/processing/`, the backend handles:

- `ComplexAgent.js`, `AgentSpawner.js`, `ComplexEnvironment.js`: Core simulation logic
- `broadcast/`, `ai/`, `gravity/`, `foodWeb/`: Plugin architecture and extensions
- Shared logic from `shared/processing/core`: agent base class, controllers, state plugins, etc.

All simulation logic is GPU-accelerated via the `WebGPUComplexEnvironment.js` class, which uses `agentUpdateShader.wgsl`.

---

## WebGPU in Cobweb Online

### Dual Use of WebGPU

Cobweb Online uses **WebGPU for both computation and rendering**:

- **Compute Shader**: `agentUpdateShader.wgsl` handles agent logic—movement, aging, reproduction, etc.
- **Render Shader**: `cobwebGridShader.wgsl` draws agents, food, and the grid to the canvas.

This dual usage lets the simulation run entirely on the GPU without needing any server-side logic.

---

## Project Structure (Simplified)

```plaintext
src/
├── modules/
│   └── cobwebGrid/
│       ├── WebGPUCanvas.tsx
│       ├── testWebGPU.js
│       ├── WebGPUComplexEnvironment.js
│       ├── cobwebGridShader.wgsl   <-- renders grid, food, agents
│       ├── agentUpdateShader.wgsl  <-- runs agent simulation logic
│       ├── processing/
│           ├── ai/, foodWeb/, etc.
│           └── ComplexAgent.js, ComplexEnvironment.js
│
├── routes/
│   └── (auth, settings, etc. - site navigation structure)
│
├── shared/
│   ├── processing/core/ (Agent, Controller, Environment classes)
│
├── views/
│   └── App.tsx, main.tsx
```

---

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/) (or `npm` if preferred)

### Install Dependencies

```bash
pnpm install
```

### Start the Dev Server (Vite)

```bash
pnpm run dev
```

You’ll see:

```
  VITE v4.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
```

### Build for Production

```bash
pnpm run build
```

Preview the production build:

```bash
pnpm run preview
```

---

## Simulation Flow

1. `randomCobwebInit.ts`: Generates random agent/food locations
2. `WebGPUComplexEnvironment.js`: Uploads this data to GPU buffers
3. `agentUpdateShader.wgsl`: Simulates logic per agent
4. `stepCobwebSimulation.ts`: Dispatches compute updates each frame
5. `cobwebGridShader.wgsl`: Renders the canvas based on agent and food buffer state

---

## Modularization Goals

We are actively working to:

- Migrate all legacy JS simulation code to TypeScript
- Decouple rendering and simulation layers further
- Consolidate and document shared logic across overlays and processing modules

---

## Contributing

To contribute to CobwebOnline:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit them
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request

All contributions must:
- Be clear and well-documented
- Avoid introducing WebGPU compatibility regressions
- Maintain simulation consistency and performance

---

## Contact

For any issues, reach out to the current maintainers via GitHub or open an issue.


