import shaderCode from './cobwebGridShader.wgsl?raw';

export interface WebGPURenderer {
    updateShapes(
        triLocations: number[][],
        triRotations: number[],
        triColors: number[],
        sqLocations: number[][],
        sqColors: number[]
    ): void;
}

// define the colors
const colors = [
    [1,0,0],    // red
    [0,0.6,1],  // blue
    [1,0.8,0],  // yellow
    [0,0.8,0],  // green
];

// color mapping
/*
    0 = red
    1 = blue
    2 = yellow
    3 = green
*/

// define the triangle rotations
const rotations = [
    [[0, 1], [1, 1], [0.5, 0]], // up
    [[0, 0], [0, 1], [1, 0.5]], // right
    [[0, 0], [1, 0], [0.5, 1]], // down
    [[1, 1], [1, 0], [0, 0.5]], // left
]

export async function initCobwebGrid(
    canvas: HTMLCanvasElement,
    defaultTriLocations: number[][],
    defaultTriRotations: number[],
    defaultTriColors: number[],
    defaultSqLocations: number[][],
    defaultSqColors: number[]
): Promise<WebGPURenderer> {
    if (!navigator.gpu) throw new Error('WebGPU not supported');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('No GPU adapter');
    const device = await adapter.requestDevice();

    // adjust canvas size for high-DPI displays (reduces blurriness)
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.clientWidth * dpr;
    canvas.height  = canvas.clientHeight * dpr;

    // configure swap chain
    const context = canvas.getContext('webgpu') as GPUCanvasContext;
    const format  = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: 'opaque' });

    // compile shader
    const module = device.createShaderModule({ code: shaderCode });

    // common vertex‐buffer layout: [ pos.x, pos.y, r, g, b ]
    const vertexBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 5 * 4,
        attributes: [
            { shaderLocation: 0, offset: 0,   format: 'float32x2' },
            { shaderLocation: 1, offset: 2 * 4, format: 'float32x3' },
        ],
    };

    // pipeline for grid lines
    const linePipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex:   { module, entryPoint: 'vs_main', buffers: [vertexBufferLayout] },
        fragment: { module, entryPoint: 'fs_main', targets: [{ format }] },
        primitive: { topology: 'line-list' },
    });

    // pipeline for triangles & squares
    const triPipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: { module, entryPoint: 'vs_main', buffers: [vertexBufferLayout] },
        fragment: { module, entryPoint: 'fs_main', targets: [{ format }] },
        primitive: { topology: 'triangle-list', cullMode: 'none' },
    });

    // helper: map grid-cell coords [0..64] to NDC
    const toNDC = (x: number, y: number): [number,number] => [
        (x / 64) * 2 - 1,
        ((64 - y) / 64) * 2 - 1,
    ];

    // build grid-lines, build buffer for it, and write buffer for it
    const gridData: number[] = [];
    for (let i = 0; i < 64; ++i) {
        // vertical
        const [vx, vy0] = toNDC(i, 0);
        const [_,  vy1] = toNDC(i, 64);
        gridData.push(vx, vy0, 0,0,0,    vx, vy1, 0,0,0);
        // horizontal
        const [hx0, hy] = toNDC(0, i);
        const [hx1, _2] = toNDC(64, i);
        gridData.push(hx0, hy, 0,0,0,    hx1, hy, 0,0,0);
    }
    const gridBuffer = device.createBuffer({
        size: gridData.length * 4,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(gridBuffer, 0, new Float32Array(gridData));

    // build the shape buffer
    const shapeBuffer = device.createBuffer({
        size: 1024 * 1024,  // FIND A BETTER, NON-ARBITRARY BUFFER UPPER BOUND (this is arbitrarily 1MB)
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    // helper: build the shapes, return the shape data
    function buildShapeData(
        triLocations: number[][],
        triRotations: number[],
        triColors: number[],
        sqLocations: number[][],
        sqColors: number[]
    ): Float32Array {
        // the shapes list that we will build up and then return
        const shapes: number[] = [];

        // build the triangles: black‐outer and colored‐inner
        const innerTriangleFactor = 0.5;
        for (let i = 0; i < triLocations.length; i++) {
            const [cx, cy] = triLocations[i];
            const [r, g, b] = colors[triColors[i]];
            const triRotation = rotations[triRotations[i]];

            // outer triangle verts (black)
            const [x0, y0] = toNDC(cx + triRotation[0][0], cy + triRotation[0][1]);
            const [x1, y1] = toNDC(cx + triRotation[1][0], cy + triRotation[1][1]);
            const [xm, ym] = toNDC(cx + triRotation[2][0], cy + triRotation[2][1]);
            shapes.push(
                x0, y0, 0,0,0,
                x1, y1, 0,0,0,
                xm, ym, 0,0,0
            );

            // centroid
            const cxm = (x0 + x1 + xm) / 3;
            const cym = (y0 + y1 + ym) / 3;

            // inner coloured triangle
            const outer = [[x0,y0],[x1,y1],[xm,ym]];
            for (let j = 0; j < 3; j++) {
                const [vx,vy] = outer[j];
                const ix = vx + (cxm - vx) * innerTriangleFactor;
                const iy = vy + (cym - vy) * innerTriangleFactor;
                shapes.push(ix, iy, r, g, b);
            }
        }

        // build the squares: 2 triangles each
        for (let i = 0; i < sqLocations.length; i++) {
            const [cx, cy] = sqLocations[i];
            const [r, g, b] = colors[sqColors[i]];
            const [aX, aY] = toNDC(cx, cy + 1);
            const [bX, bY] = toNDC(cx + 1, cy + 1);
            const [cX, cY] = toNDC(cx + 1, cy);
            const [dX, dY] = toNDC(cx, cy);
            
            // triangle 1 (A to B to C)
            shapes.push(
                aX, aY, r, g, b,
                bX, bY, r, g, b,
                cX, cY, r, g, b
            );
            // triangle 2 (A to C to D)
            shapes.push(
                aX, aY, r, g, b,
                cX, cY, r, g, b,
                dX, dY, r, g, b
            );
        }

        return new Float32Array(shapes);
    }

    // helper: render the shapes and gridlines
    function render(numShapes: number) {
        const cmd = device.createCommandEncoder();
        const pass = cmd.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                loadOp: 'clear', clearValue: {r:1, g:1, b:1, a:1}, storeOp: 'store'
            }],
        });

        // draw triangles and squares
        pass.setPipeline(triPipeline);
        pass.setVertexBuffer(0, shapeBuffer);
        pass.draw(numShapes / 5);

        // draw grid
        pass.setPipeline(linePipeline);
        pass.setVertexBuffer(0, gridBuffer);
        pass.draw(gridData.length / 5);

        pass.end();
        device.queue.submit([cmd.finish()]);
    };

    // helper: update the shape buffer
    function updateShapes(
        triLocations: number[][] = [],
        triRotations: number[] = [],
        triColors: number[] = [],
        sqLocations: number[][] = [],
        sqColors: number[] = []
    ) {
        const shapeData = buildShapeData(
            triLocations ?? [],
            triRotations ?? [],
            triColors ?? [],
            sqLocations ?? [],
            sqColors ?? []
        );
        device.queue.writeBuffer(shapeBuffer, 0, shapeData);
        render(shapeData.length);
    }


    updateShapes(
        defaultTriLocations,
        defaultTriRotations,
        defaultTriColors,
        defaultSqLocations,
        defaultSqColors
    );

    return { updateShapes };
}
