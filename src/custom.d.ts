// TypeScript declaration so Vite can import .wgsl files and it won't complain

declare module '*.wgsl?raw' {
    const code: string;
    export default code;
}
