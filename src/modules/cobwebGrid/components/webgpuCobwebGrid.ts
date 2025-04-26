// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const initCobwebGrid = async (canvas: HTMLCanvasElement) => {
    if ('gpu' in navigator) {
        console.log('WebGPU is supported');
    } else {
        console.log('WebGPU is not supported');
    }
};
