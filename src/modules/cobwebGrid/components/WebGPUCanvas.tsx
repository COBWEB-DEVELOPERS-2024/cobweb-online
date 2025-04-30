import { useEffect, useRef } from "react";
import { initCobwebGrid, WebGPURenderer } from "./webgpuCobwebGrid";
import Simulation from '../processing/Simulation';
import {
    randomCobwebInit,
    stepCobwebSimulation,
    getAgentLocationRotationColors,
    getFoodLocationColors
} from "./randomCobwebInit";

interface WebGPUCanvasProps {
    paused: boolean;
    step: boolean;
    disableStep: () => void;
}

const WebGPUCanvas = ({ paused, step, disableStep }: WebGPUCanvasProps) => {
    const hasInit = useRef(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<WebGPURenderer | null>(null);

    var simulation: Simulation | null = null;
    var triLocations: number[][] = [];
    var triRotations: number[] = [];
    var triColors: number[] = [];
    var sqLocations: number[][] = [];
    var sqColors: number[] = [];

    // useEffect to initialize the canvas and renderer
    useEffect(() => {
        if (hasInit.current) return;
        hasInit.current = true;

        // initialize the canvas with WebGPU, obtain the renderer so we can later update the grid
        if (canvasRef.current) {
            randomCobwebInit().then(sim => {
                simulation = sim;
                console.log("Simulation initialized:", simulation?.getFoodData());

                [triLocations, triRotations, triColors] = getAgentLocationRotationColors(sim);
                [sqLocations, sqColors] = getFoodLocationColors(sim);

                initCobwebGrid(
                    canvasRef.current!,
                    triLocations,
                    triRotations,
                    triColors,
                    sqLocations,
                    sqColors
                ).then(renderer => {
                    rendererRef.current = renderer;
                }).catch(console.error);
            });
        }
    }, []);

    // helper: a function to update the grid
    function updateGrid() {
        if (rendererRef.current) {
            // for (let i = 0; i < triLocations.length; i++) {
            //     triLocations[i][0] += 1;
            // }
            // rendererRef.current.updateShapes(
            //     triLocations,
            //     triRotations,
            //     triColors,
            //     sqLocations,
            //     sqColors
            // );
            console.log(rendererRef.current);
        }
    }

    // useEffect to start the update loop when 'Play' is clicked, and pause it when 'Pause' is clicked
    useEffect(() => {
        // ensure the simulation is not paused
        if (paused) return;

        // start the update loop for the cobweb grid
        const id = setInterval(() => {
            updateGrid();
        }, 1000);

        // clear the interval on unmount to prevent memory leakage
        console.log("Interval ID:", id);
        return () => clearInterval(id);
    }, [paused]);

    // useEffect to update the grid once when 'Step' is clicked
    useEffect(() => {
        // ensure that step has been pressed, and that the simulation is paused
        if (!step || !paused) return;

        // update the grid once
        updateGrid();

        // set step to false to prevent subsequent updates
        disableStep();
    }, [step]);

    return (
        <div className="flex justify-center items-center flex-grow">
            <canvas
                ref={canvasRef}
                className="w-[85vh] h-[85vh] aspect-square border-3 border-emerald-600 shadow-xl"
            />
        </div>
    );
};

export default WebGPUCanvas;
