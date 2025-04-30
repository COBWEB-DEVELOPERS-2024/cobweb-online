# cobweb-online
COBWEB is an agent-based simulation environment used by over 100 students every year for research in ecology, economics, and more. This version of COBWEB is available online and is primarily made with TypeScript, JavaScript, React, and WebGPU.
Got it! Here's your clean and professional `README.md` for **CobwebOnline**, written in GitHub-flavored Markdown **without emojis**, and tailored to reflect that this project is both the frontend and backend combined:

---


# CobwebOnline

## About CobwebOnline

CobwebOnline is a fully browser-native, GPU-accelerated agent-based simulation inspired by ecological dynamics and complex systems theory. It is a complete reimagining of the original Java-based COBWEB project, built using modern WebGPU compute shaders and JavaScript/TypeScript. The simulation runs entirely in the browser, without any backend servers or databases.

Agents in the simulation are autonomous and interact with food, terrain, and one another through simple local rules. They consume energy, age, reproduce (asexually or sexually), and die. These simple mechanics give rise to emergent behaviors that can be observed and studied in real-time.

This repository contains all code needed to run CobwebOnline: the frontend interface, the WebGPU-based simulation backend, and the shaders that drive agent behavior.

---

## System Architecture

```
                        ┌────────────────────────────┐
                        │    WebGPU Shader Logic     │
                        │  (agentUpdateShader.wgsl)  │
                        └────────────┬───────────────┘
                                     │
                                     ▼
          ┌───────────────────────────────────────────────┐
          │ WebGPUComplexEnvironment (JavaScript/TS Class)│
          │ - Initializes GPU buffers (agents,food,stones)│
          │ - Uploads data to GPU                         │
          │ - Dispatches compute workgroups               │
          │ - Downloads updated state from GPU            │
          └────────────────────────────┬──────────────────┘
                                       │
                                       ▼
                        ┌────────────────────────────┐
                        │    RandomCobwebinit.ts     │
                        │ - Adds agents, food, stones│
                        │ - Calls step() per frame   │
                        │ - Provides state for rendering/logging │
                        └────────────────────────────┘
```

---

## Features

- Real-time agent-based simulation powered by WebGPU
- Autonomous agents with attributes: position, energy, age, type, and alive status
- Asexual and sexual reproduction logic with type checking
- Impassable stone terrain that influences agent pathing
- Agent aging and death logic based on energy depletion or age
- All simulation logic and rendering occurs client-side

---

## Development Instructions

### Prerequisites

- [Node.js](https://nodejs.org/en/download) (v18 or higher)
- A Chromium-based browser with WebGPU support (Chrome 113+)
- [Vite](https://vitejs.dev/) for local development

### Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/your-username/cobweb-online.git
cd cobweb-online
npm install
```

### Starting the Dev Server

```bash
npm run dev
```

You should see something like:

```
  VITE v5.0.0  ready in 300ms

  ➜  Local:   http://localhost:3000/
```

Open the link in a WebGPU-supported browser.

---

## File Structure Overview

```
cobweb-online/
├── index.html                # Entry point
├── main.ts                   # Boots up the simulation
├── /processing/              # Simulation logic and classes
│   ├── Simulation.ts         # Main controller class
│   └── ComplexAgent.ts       # Agent model
├── /components/
│   └── WebGPUComplexEnvironment.ts # WebGPU logic
├── /shaders/
│   └── agentUpdateShader.wgsl # Compute shader
├── vite.config.ts            # Vite configuration
└── tsconfig.json             # TypeScript configuration
```

---

## How It Works

1. **WebGPUComplexEnvironment** manages GPU buffer setup, uploading data to GPU (agents, food, stones), and reading it back after compute passes.
2. **agentUpdateShader.wgsl** contains the compute logic:
    - Moves agents unless blocked by stones
    - Allows agents to eat matching food
    - Handles aging and death
    - Triggers asexual or sexual reproduction when conditions are met
4. The browser executes all logic locally; no API calls or backend servers are used.

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

## License

This project is open source and available under the MIT License.
```

Let me know if you'd like a `LICENSE` file, a starter `tsconfig.json`, or a Vite `vite.config.ts` to pair with this.
```
