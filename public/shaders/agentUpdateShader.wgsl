// agentUpdateShader.wgsl - updated shader with food type support

struct Agent {
    pos: vec2f,
    dir: vec2f,
    energy: f32,
    alive: u32,
    agenttype: u32,
};

struct Food {
    pos: vec2f,
    foodtype: u32,
};

@group(0) @binding(0) var<storage, read_write> agents: array<Agent>;
@group(0) @binding(1) var<storage, read_write> food: array<Food>;

fn isSameCell(a: vec2f, b: vec2f) -> bool {
    return abs(a.x - b.x) < 1.0 && abs(a.y - b.y) < 1.0;
}

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

    // Move agent
    agent.pos.x += 0.5 * (f32(index % 3) - 1.0);
    agent.pos.y += 0.5 * (f32(index % 5) - 2.0);

    // Check for matching food and eat it
    for (var i = 0u; i < arrayLength(&food); i++) {
        if (food[i].foodtype == agent.agenttype && isSameCell(agent.pos, food[i].pos)) {
            agent.energy += 25.0;
            food[i].pos = vec2f(-9999.0, -9999.0); // Mark food as "eaten"
            break;
        }
    }

    // Energy decay
    agent.energy -= 1.0;

    if (agent.energy <= 0.0) {
        agent.alive = 0u;
        agent.energy = 0.0;
    }

    if (agent.energy >= 150.0) {
        agent.energy = 75.0;
    }
}
