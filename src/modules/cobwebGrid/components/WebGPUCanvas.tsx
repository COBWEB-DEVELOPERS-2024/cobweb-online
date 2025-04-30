import { useEffect, useRef } from "react";
import { initCobwebSimulation } from "./testWebGPU.js";

const WebGPUCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            initCobwebSimulation(canvasRef.current).catch(console.error);
        }
    }, []);

    return (
        <div className="flex justify-center items-center flex-grow">
            <canvas
                ref={canvasRef}
                className="w-[85vh] h-[85vh] border-3 border-emerald-600 shadow-xl"
            />
        </div>
    );
};

export default WebGPUCanvas;
