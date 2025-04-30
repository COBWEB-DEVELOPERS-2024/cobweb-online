struct Agent {
    pos: vec2f,
    dir: vec2f,
    energy: f32,
    alive: u32,
    atype: u32,
    age: u32, // unused
};

struct Food {
    pos: vec2f,
    foodType: u32,
};

struct SimParams {
    tick: u32,
};

@group(0) @binding(0) var<storage, read_write> agents: array<Agent>;
@group(0) @binding(1) var<storage, read_write> food: array<Food>;
@group(0) @binding(2) var<storage, read> stones: array<vec2f>;
@group(0) @binding(3) var<uniform> params: SimParams;

fn isSameCell(a: vec2f, b: vec2f) -> bool {
    return abs(a.x - b.x) < 1.0 && abs(a.y - b.y) < 1.0;
}

fn isStone(pos: vec2f) -> bool {
    for (var i = 0u; i < arrayLength(&stones); i++) {
        if (isSameCell(pos, stones[i])) {
            return true;
        }
    }
    return false;
}

fn wrap64(pos: vec2f) -> vec2f {
    return vec2f(
        f32((u32(pos.x + 64.0) % 64u)),
        f32((u32(pos.y + 64.0) % 64u))
    );
}

// Simple deterministic hash for pseudo-random number generation
fn hash(n: u32) -> u32 {
    var x = n;
    x = ((x >> 16u) ^ x) * 0x45d9f3bu;
    x = ((x >> 16u) ^ x) * 0x45d9f3bu;
    return (x >> 16u) ^ x;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;
    if (index >= arrayLength(&agents)) { return; }

    let agent = &agents[index];
    if (agent.alive == 0u) { return; }

    // Random direction based on tick and index
    let seed = params.tick * 73856093u + index * 19349663u;
    let dir = hash(seed) % 4u;

    var offset = vec2f(0.0, 0.0);
    if (dir == 0u) {
        offset = vec2f(1.0, 0.0);  // right
    } else if (dir == 1u) {
        offset = vec2f(-1.0, 0.0); // left
    } else if (dir == 2u) {
        offset = vec2f(0.0, 1.0);  // up
    } else {
        offset = vec2f(0.0, -1.0); // down
    }

    let newPos = wrap64(agent.pos + offset);
    if (!isStone(newPos)) {
        agent.pos = newPos;
    }

    // Eat food
    for (var i = 0u; i < arrayLength(&food); i++) {
        if (isSameCell(agent.pos, food[i].pos)) {
            agent.energy += 25.0;
            food[i].pos = vec2f(-9999.0, -9999.0);
            break;
        }
    }


    // Energy decay
    agent.energy -= 1.0;

    if (agent.energy <= 0.0) {
        agent.alive = 0u;
        agent.energy = 0.0;
        return;
    }

    // Clamp energy
    if (agent.energy > 150.0) {
        agent.energy = 75.0;
    }
}
