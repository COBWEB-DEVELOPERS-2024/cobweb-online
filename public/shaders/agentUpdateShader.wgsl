struct Agent {
    pos: vec2<u32>,
    _pad: vec2<u32>,
    energy: u32,
    alive: u32,
    dir: vec2<i32>,
};

struct Food {
    x: u32,
    y: u32,
    foodType: u32,
};

@group(0) @binding(0) var<storage, read_write> agents: array<Agent>;
@group(0) @binding(1) var<storage, read_write> food: array<Food>;
@group(0) @binding(2) var<storage, read> stones: array<vec2<u32>>;
@group(0) @binding(3) var<uniform> randSeed: u32;
@group(0) @binding(4) var<storage, read_write> occupancyGrid: array<atomic<u32>>;

const GRID_SIZE: u32 = 64u;
const MAX_FOOD: u32 = 500u;
const MAX_STONES: u32 = 200u;
const FOOD_TYPE_NONE: u32 = 9999u;

fn wang_hash(seed: u32) -> u32 {
    var x = seed;
    x = (x ^ 61u) ^ (x >> 16u);
    x = x + (x << 3u);
    x = x ^ (x >> 4u);
    x = x * 0x27d4eb2du;
    x = x ^ (x >> 15u);
    return x;
}

fn randomDir(agentId: u32, randSeed: u32) -> u32 {
    return wang_hash(agentId ^ randSeed) % 4u;
}

fn shouldMove(agentId: u32, randSeed: u32) -> bool {
    return (wang_hash(agentId + randSeed + 202u) % 2u) == 1u;
}

fn gridIndex(x: u32, y: u32) -> u32 {
    return y * GRID_SIZE + x;
}

fn isBlocked(x: u32, y: u32) -> bool {
    for (var i = 0u; i < MAX_STONES; i++) {
        if (stones[i].x == x && stones[i].y == y) {
            return true;
        }
    }
    return false;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let id = global_id.x;
    if (id >= arrayLength(&agents)) { return; }

    var agent = agents[id];
    if (agent.alive == 0u) { return; }

    let dir = randomDir(id, randSeed);
    let moveNow = shouldMove(id, randSeed);

    var newPos = agent.pos;
    var dx: i32 = 0;
    var dy: i32 = 0;

    if (moveNow) {
        if (dir == 0u && agent.pos.y > 0u) {
            newPos.y = agent.pos.y - 1u;
            dy = -1;
        } else if (dir == 1u && agent.pos.y < GRID_SIZE - 1u) {
            newPos.y = agent.pos.y + 1u;
            dy = 1;
        } else if (dir == 2u && agent.pos.x > 0u) {
            newPos.x = agent.pos.x - 1u;
            dx = -1;
        } else if (dir == 3u && agent.pos.x < GRID_SIZE - 1u) {
            newPos.x = agent.pos.x + 1u;
            dx = 1;
        }

        if (!isBlocked(newPos.x, newPos.y)) {
            let idx = gridIndex(newPos.x, newPos.y);
            let claim = atomicCompareExchangeWeak(&occupancyGrid[idx], 0u, id + 1u);
            if (claim.exchanged) {
                agent.pos = newPos;
            } else {
                dx = 0;
                dy = 0;
            }
        } else {
            dx = 0;
            dy = 0;
        }
    }

    agent.dir = vec2<i32>(dx, dy);

    for (var i = 0u; i < MAX_FOOD; i++) {
        if (food[i].foodType != FOOD_TYPE_NONE &&
            food[i].x == agent.pos.x &&
            food[i].y == agent.pos.y) {
            food[i].foodType = FOOD_TYPE_NONE;
            agent.energy = agent.energy + 10u;
            break;
        }
    }

    if (agent.energy > 0u) {
        agent.energy = agent.energy - 1u;
    } else {
        agent.alive = 0u;
    }

    agents[id] = agent;
}
