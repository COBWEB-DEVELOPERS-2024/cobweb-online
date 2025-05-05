import { useEffect, useRef } from "react";
import { initCobwebGrid, WebGPURenderer } from "./webgpuCobwebGrid";
import { Simulation } from '../processing/Simulation';
import {
    randomCobwebInit,
    stepCobwebSimulation,
    getAgentLocationRotationColors,
    getFoodLocationColors
} from "./randomCobwebInit";

interface WebGPUCanvasProps {
    paused: boolean;
    speedFactor: number;
    step: boolean;
    disableStep: () => void;
}

const WebGPUCanvas = ({ paused, speedFactor, step, disableStep }: WebGPUCanvasProps) => {
    const hasInit = useRef(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<WebGPURenderer | null>(null);
    const simulationRef = useRef<Simulation | null>(null);
    var triLocations: number[][] = [];
    var triRotations: number[] = [];
    var triColors: number[] = [];
    var sqLocations: number[][] = [];
    var sqColors: number[] = [];

    // helper: update the rendering data defined above
    function updateRenderingData() {
        if (!simulationRef.current) return;
        [triLocations, triRotations, triColors] = getAgentLocationRotationColors(simulationRef.current);
        [sqLocations, sqColors] = getFoodLocationColors(simulationRef.current);
        console.log(simulationRef.current.getFoodData());
    }

    // helper: a function to turn the speed factor into the ms between updates
    function getSpeed(): number {
        return Math.floor(1000 / speedFactor);
    }

    // useEffect to initialize the canvas and renderer
    useEffect(() => {
        if (hasInit.current) return;
        hasInit.current = true;

        // initialize the canvas with WebGPU, obtain the renderer so we can later update the grid
        if (canvasRef.current) {
            randomCobwebInit().then(sim => {
                simulationRef.current = sim;
                updateRenderingData();
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
        if (rendererRef.current && simulationRef.current) {
            console.log(simulationRef.current);
            stepCobwebSimulation(simulationRef.current).then(() => {
                updateRenderingData();
                rendererRef.current!.updateShapes(
                    triLocations,
                    triRotations,
                    triColors,
                    sqLocations,
                    sqColors
                );
            }).catch(console.error);
        }
    }

    // useEffect to start the update loop when 'Play' is clicked, and pause it when 'Pause' is clicked
    useEffect(() => {
        // ensure the simulation is not paused
        if (paused) return;

        // start the update loop for the cobweb grid
        const id = setInterval(() => {
            updateGrid();
        }, getSpeed());

        // clear the interval on unmount to prevent memory leakage
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
