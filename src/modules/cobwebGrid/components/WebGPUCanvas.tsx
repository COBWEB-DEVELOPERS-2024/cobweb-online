import { useEffect, useRef, useState } from "react";
import { initCobwebGrid, WebGPURenderer } from "./webgpuCobwebGrid";
import {Simulation} from '../processing/Simulation';
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
    speedFactor: number;
}

const WebGPUCanvas = ({ paused, speedFactor, step, disableStep }: WebGPUCanvasProps) => {
    const hasInit = useRef(false);
    const [ready, setReady] = useState(false);
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

    // helper: get milliseconds between updates from speed factor
    function getUpdateInterval() {
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
                    setReady(true); // mark as ready to enable interactions
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
        }, getUpdateInterval());

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

    function clientToCanvasXY(ev: MouseEvent, canvas: HTMLCanvasElement) {
        const rect = canvas.getBoundingClientRect();
        const cssX = ev.clientX - rect.left;
        const cssY = ev.clientY - rect.top;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return { x: cssX * scaleX, y: cssY * scaleY };
    }

    function canvasXYToCell(x: number, y: number, canvas: HTMLCanvasElement) {
        const GRID = 64; // assuming a 64x64 grid
        const cellW = canvas.width / GRID;
        const cellH = canvas.height / GRID;
        const i = Math.max(0, Math.min(GRID - 1, Math.floor(x / cellW)));
        const j = Math.max(0, Math.min(GRID - 1, Math.floor(y / cellH)));
        return { i, j };
    }

    useEffect(() => {
        if (!ready) return;
        const canvas = canvasRef.current;
        const sim = simulationRef.current;
        if (!canvas || !sim) return;

    let drawing = false;

    const refresh = () => {
        updateRenderingData();
        rendererRef.current?.updateShapes(
        triLocations, triRotations, triColors, sqLocations, sqColors
        );
    };

    const placeRockEvt = (ev: MouseEvent) => {
        const { x, y } = clientToCanvasXY(ev, canvas);
        const { i, j } = canvasXYToCell(x, y, canvas);
        sim.addRock(i, j);
        refresh();
    };

    const onMouseDown = (ev: MouseEvent) => { drawing = true; placeRockEvt(ev); };
    const onMouseMove = (ev: MouseEvent) => { if (drawing) placeRockEvt(ev); };
    const onMouseUp = () => { drawing = false; };
    const onMouseLeave = () => { drawing = false; };

    const onContextMenu = (ev: MouseEvent) => {
        ev.preventDefault();
        const { x, y } = clientToCanvasXY(ev, canvas);
        const { i, j } = canvasXYToCell(x, y, canvas);
        sim.removeRock(i, j);
        refresh();
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("contextmenu", onContextMenu);

    return () => {
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("mouseleave", onMouseLeave);
        canvas.removeEventListener("contextmenu", onContextMenu);
    };
    }, [ready]);


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
