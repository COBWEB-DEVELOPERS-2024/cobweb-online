// TypeScript declaration so Vite can import .wgsl files

declare module '*.wgsl' {
    const code: string;
    export default code;
}
