
// geneticAIShader.wgsl - Applies weights to inputs to compute agent actions

struct Agent {
    position : vec2u,
    energy : f32,
    weightsOffset : u32,
};

@group(0) @binding(0) var<storage, read> agents : array<Agent>;
@group(0) @binding(1) var<storage, read> inputs : array<f32>;
@group(0) @binding(2) var<storage, read> weights : array<f32>;
@group(0) @binding(3) var<storage, read_write> decisions : array<u32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id : vec3<u32>) {
    let i = id.x;
    if (i >= arrayLength(&agents)) { return; }

    let agent = agents[i];
    var sum = 0.0;

    for (var j = 0u; j < 8u; j = j + 1u) {
        let inputVal = inputs[i * 8u + j];
        let weightVal = weights[agent.weightsOffset + j];
        sum = sum + inputVal * weightVal;
    }

    decisions[i] = u32(sum) % 4u;
}
