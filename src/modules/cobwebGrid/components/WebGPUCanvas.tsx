import { useEffect, useRef, useState } from "react";
import { initCobwebGrid, WebGPURenderer } from "./webgpuCobwebGrid";
import {Simulation} from '../processing/Simulation';
import { Location } from '../../../shared/processing/core/Location';
import {
    randomCobwebInit,
    stepCobwebSimulation,
    getAgentLocationRotationColors,
    getFoodLocationColors,
    getRockLocations
} from "./randomCobwebInit";

interface WebGPUCanvasProps {
    paused: boolean;
    step: boolean;
    disableStep: () => void;
    speedFactor: number;
    foodMode: boolean;
    selectedFoodColor: number;
}

const WebGPUCanvas = ({ paused, speedFactor, step, disableStep, foodMode, selectedFoodColor }: WebGPUCanvasProps) => {
    const hasInit = useRef(false);
    const [ready, setReady] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<WebGPURenderer | null>(null);
    const simulationRef = useRef<Simulation | null>(null);
    const rockRef = useRef<number[][]>([]); // to track placed rocks
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
        rockRef.current = getRockLocations(simulationRef.current);
    }

    // helper: get milliseconds between updates from speed factor
    function getUpdateInterval() {
        return Math.floor(1000 / speedFactor);
    }

    // helper: convert mouse coordinates to grid coordinates
    function mouseToGridCoordinates(mouseX: number, mouseY: number, canvas: HTMLCanvasElement): { x: number; y: number } {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const canvasX = (mouseX - rect.left) * scaleX;
        const canvasY = (mouseY - rect.top) * scaleY;
        
        const gridX = Math.floor((canvasX / canvas.width) * 64);
        const gridY = Math.floor((canvasY / canvas.height) * 64);
        
        return { x: Math.max(0, Math.min(63, gridX)), y: Math.max(0, Math.min(63, gridY)) };
    }

    function handleFoodPlacement(event: React.MouseEvent<HTMLCanvasElement>) {
        if (!foodMode || !simulationRef.current || !canvasRef.current) return;
        // ensure that foodmode is enabled, the simulationref is set, the canvasref is also set
        
        const { x, y } = mouseToGridCoordinates(event.clientX, event.clientY, canvasRef.current);
        
        // add food at the clicked location with selected color   
        simulationRef.current.addFood(new Location(x, y), selectedFoodColor);
        
        // update rendering data to show the new food
        updateRenderingData();
        if (rendererRef.current) {
            rendererRef.current.updateShapes(
                triLocations,
                triRotations,
                triColors,
                sqLocations,
                sqColors
            );
        }
        
        // debug log
        console.log(`Added food at grid position (${x}, ${y})`);
    }

    // helper: handle mouse click for food placement
    function handleCanvasClick(event: React.MouseEvent<HTMLCanvasElement>) {
        if (foodMode) {
            handleFoodPlacement(event);
        }
        // else, could handle other click interactions here
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
                    sqColors,
                    rockRef.current
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
                    sqColors,
                    rockRef.current
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
        triLocations, triRotations, triColors, sqLocations, sqColors,rockRef.current
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
                onClick={handleCanvasClick}
            />
        </div>
    );
};

export default WebGPUCanvas;
