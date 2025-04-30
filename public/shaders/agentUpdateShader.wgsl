struct Agent {
    pos: vec2f,
    dir: vec2f,
    energy: f32,
    alive: u32,
};

@group(0) @binding(0) var<storage, read_write> agents: array<Agent>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;
    if (index >= arrayLength(&agents)) {
        return;
    }

    let agent = &agents[index];

    if (agent.alive == 0u) {
        return;
    }

    agent.pos.x = agent.pos.x + (0.5 * (f32(index % 3) - 1.0));
    agent.pos.y = agent.pos.y + (0.5 * (f32(index % 5) - 2.0));

    agent.energy = agent.energy - 1.0;

    if (agent.energy <= 0.0) {
        agent.alive = 0u;
        agent.energy = 0.0;
    }

    if (agent.energy >= 150.0) {
        agent.energy = 75.0;
    }
}
