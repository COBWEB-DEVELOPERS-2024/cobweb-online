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
    placeStonesMode: boolean;
    removeAllFood: boolean;
    setRemoveAllFood: (b: boolean) => void;
    removeAllStones: boolean;
    setRemoveAllStones: (b: boolean) => void;
    removeAllAgents: boolean;
    setRemoveAllAgents: (b: boolean) => void;
    removeAllWaste: boolean;
    setRemoveAllWaste: (b: boolean) => void;
    removeAll: boolean;
    setRemoveAll: (b: boolean) => void;
    moveAgentsMode: boolean;
    moveFoodMode: boolean;
}

const WebGPUCanvas = ({ 
    paused, 
    speedFactor, 
    step, 
    disableStep, 
    foodMode, 
    selectedFoodColor, 
    placeStonesMode, 
    removeAllFood, 
    setRemoveAllFood,
    removeAllStones,
    setRemoveAllStones,
    removeAllAgents,
    setRemoveAllAgents,
    removeAllWaste,
    setRemoveAllWaste,
    removeAll,
    setRemoveAll,
    moveAgentsMode,
    moveFoodMode
}: WebGPUCanvasProps) => {
    const hasInit = useRef(false);
    const [ready, setReady] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<WebGPURenderer | null>(null);
    const simulationRef = useRef<Simulation | null>(null);
    const rockRef = useRef<number[][]>([]); // to track placed rocks
    const isDragLockRef = useRef(false);
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

        const existingFood = simulationRef.current.getFoodData().find(food => food.x === x && food.y === y);
        const existingAgent = simulationRef.current.getAgentData().find(agent => agent.position && agent.position.x === x && agent.position.y === y);

        if (existingFood || existingAgent) {
            console.log(`Cannot place food at (${x}, ${y}): already occupied`);
            return; // do not place food if the location is already occupied
        }
        
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
                sqColors,
                rockRef.current
            );
        }
        
        // debug log
        console.log(`Added food at grid position (${x}, ${y})`);
    }

    function handleCanvasClick(event: React.MouseEvent<HTMLCanvasElement>) {
        if (foodMode && !moveFoodMode) {
        handleFoodPlacement(event);
        }
    }

    // useEffect to clear the grid when removeAllFood is toggled
    // Run only when `removeAllFood` changes to avoid running on every render
    useEffect(() => {
        if (!simulationRef.current) return;

        const sim = simulationRef.current;

        if (!removeAllFood) return;

        console.log("removeAllFood triggered: clearing all food from the grid");

        // Diagnostic: log counts before clearing
        try {
            console.log('Agents before clear:', sim.getAgentData().length);
            console.log('Food before clear:', sim.getFoodData().length);
        } catch (e) {
            console.warn('Could not read sim data before clear:', e);
        }

        // clear only food (do not touch agents/stones/waste)
        sim.clearFood();

        // Diagnostic: log counts after clearing
        try {
            console.log('Agents after clear:', sim.getAgentData().length);
            console.log('Food after clear:', sim.getFoodData().length);
        } catch (e) {
            console.warn('Could not read sim data after clear:', e);
        }

        // refresh rendering data and push to GPU renderer
        updateRenderingData();

        if (rendererRef.current) {
            rendererRef.current.updateShapes(
                triLocations,
                triRotations,
                triColors,
                sqLocations,
                sqColors,
                rockRef.current
            );
        }

        // reset the flag in parent
        try {
            setRemoveAllFood(false);
        } catch (e) {
            // setRemoveAllFood should be the state setter from the parent;
            // if not, just log the error rather than throwing
            console.error('Failed to reset removeAllFood flag:', e);
        }

    }, [removeAllFood]);

    // useEffect to clear all stones when removeAllStones is toggled
    useEffect(() => {
        if (!simulationRef.current) return;

        const sim = simulationRef.current;

        if (!removeAllStones) return;

        console.log("removeAllStones triggered: clearing all stones from the grid");

        // Diagnostic: log counts before clearing
        try {
            console.log('Stones before clear:', sim.getStoneData().length);
        } catch (e) {
            console.warn('Could not read sim data before clear:', e);
        }

        // clear only stones
        sim.clearStones();
        
        // Clear the local rockRef array that tracks placed rocks
        rockRef.current = [];

        // Diagnostic: log counts after clearing
        try {
            console.log('Stones after clear:', sim.getStoneData().length);
        } catch (e) {
            console.warn('Could not read sim data after clear:', e);
        }

        // refresh rendering data and push to GPU renderer
        updateRenderingData();

        if (rendererRef.current) {
            rendererRef.current.updateShapes(
                triLocations,
                triRotations,
                triColors,
                sqLocations,
                sqColors,
                rockRef.current
            );
        }

        // reset the flag in parent
        try {
            setRemoveAllStones(false);
        } catch (e) {
            console.error('Failed to reset removeAllStones flag:', e);
        }
    }, [removeAllStones]);

    // useEffect to clear all agents when removeAllAgents is toggled
    useEffect(() => {
        if (!simulationRef.current) return;

        const sim = simulationRef.current;

        if (!removeAllAgents) return;

        console.log("removeAllAgents triggered: clearing all agents from the grid");

        // Diagnostic: log counts before clearing
        try {
            console.log('Agents before clear:', sim.getAgentData().length);
        } catch (e) {
            console.warn('Could not read sim data before clear:', e);
        }

        // clear only agents
        sim.clearAgents();

        // Diagnostic: log counts after clearing
        try {
            console.log('Agents after clear:', sim.getAgentData().length);
        } catch (e) {
            console.warn('Could not read sim data after clear:', e);
        }

        // refresh rendering data and push to GPU renderer
        updateRenderingData();

        if (rendererRef.current) {
            rendererRef.current.updateShapes(
                triLocations,
                triRotations,
                triColors,
                sqLocations,
                sqColors,
                rockRef.current
            );
        }

        // reset the flag in parent
        try {
            setRemoveAllAgents(false);
        } catch (e) {
            console.error('Failed to reset removeAllAgents flag:', e);
        }
    }, [removeAllAgents]);

    // useEffect to clear all waste when removeAllWaste is toggled
    useEffect(() => {
        if (!simulationRef.current) return;

        const sim = simulationRef.current;

        if (!removeAllWaste) return;

        console.log("removeAllWaste triggered: clearing all waste from the grid");

        // clear only waste
        sim.clearWaste();

        // refresh rendering data and push to GPU renderer
        updateRenderingData();

        if (rendererRef.current) {
            rendererRef.current.updateShapes(
                triLocations,
                triRotations,
                triColors,
                sqLocations,
                sqColors,
                rockRef.current
            );
        }

        // reset the flag in parent
        try {
            setRemoveAllWaste(false);
        } catch (e) {
            console.error('Failed to reset removeAllWaste flag:', e);
        }
    }, [removeAllWaste]);

    // useEffect to clear everything when removeAll is toggled
    useEffect(() => {
        if (!simulationRef.current) return;

        const sim = simulationRef.current;

        if (!removeAll) return;

        console.log("removeAll triggered: clearing everything from the grid");

        // Diagnostic: log counts before clearing
        try {
            console.log('Agents before clear:', sim.getAgentData().length);
            console.log('Food before clear:', sim.getFoodData().length);
            console.log('Stones before clear:', sim.getStoneData().length);
        } catch (e) {
            console.warn('Could not read sim data before clear:', e);
        }

        // clear everything
        sim.clearAll();
        
        // Clear the local rockRef array that tracks placed rocks
        rockRef.current = [];

        // Diagnostic: log counts after clearing
        try {
            console.log('Agents after clear:', sim.getAgentData().length);
            console.log('Food after clear:', sim.getFoodData().length);
            console.log('Stones after clear:', sim.getStoneData().length);
        } catch (e) {
            console.warn('Could not read sim data after clear:', e);
        }

        // refresh rendering data and push to GPU renderer
        updateRenderingData();

        if (rendererRef.current) {
            rendererRef.current.updateShapes(
                triLocations,
                triRotations,
                triColors,
                sqLocations,
                sqColors,
                rockRef.current
            );
        }

        // reset the flag in parent
        try {
            setRemoveAll(false);
        } catch (e) {
            console.error('Failed to reset removeAll flag:', e);
        }
    }, [removeAll]);

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
        if (isDragLockRef.current) {
            updateRenderingData();
            rendererRef.current!.updateShapes(
            triLocations,
            triRotations,
            triColors,
            sqLocations,
            sqColors,
            rockRef.current);
        return;
    }

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

    const onMouseDown = (ev: MouseEvent) => { 
        if(!placeStonesMode) return;  //only place rocks if in place stones mode
        drawing = true; 
        placeRockEvt(ev); };
    const onMouseMove = (ev: MouseEvent) => { if (drawing) placeRockEvt(ev); };
    const onMouseUp = () => { drawing = false; };
    const onMouseLeave = () => { drawing = false; };

    const onContextMenu = (ev: MouseEvent) => {
        ev.preventDefault();
        if(!placeStonesMode) return;    //only remove rocks if in place stones mode
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
    }, [ready,placeStonesMode]);

    useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const sim = simulationRef.current;
    if (!canvas || !sim) return;

    if ((!moveAgentsMode && !moveFoodMode) || placeStonesMode) return;

    let dragging: null | { kind: "agent" | "food"; i: number; j: number } = null;

    const refresh = () => {
        updateRenderingData();
        rendererRef.current?.updateShapes(
        triLocations,
        triRotations,
        triColors,
        sqLocations,
        sqColors,
        rockRef.current
        );
    };

    const onPointerDown = (ev: PointerEvent) => {
        if (ev.button !== 0) return;
        const { x, y } = clientToCanvasXY(ev as any as MouseEvent, canvas);
        const { i, j } = canvasXYToCell(x, y, canvas);

        const hitAgent = sim.getAgentAt(i, j);
        const foodIdx = sim.getFoodIndexAt(i, j);

        if (moveAgentsMode && hitAgent) {
        dragging = { kind: "agent", i, j };
        isDragLockRef.current = true;
        canvas.setPointerCapture?.(ev.pointerId);
        ev.preventDefault();
        return;
        }

        if (moveFoodMode && foodIdx !== -1) {
        dragging = { kind: "food", i, j };
        isDragLockRef.current = true;
        canvas.setPointerCapture?.(ev.pointerId);
        ev.preventDefault();
        return;
        }
    };

    const onPointerMove = (ev: PointerEvent) => {
        if (!dragging) return;
        const { x, y } = clientToCanvasXY(ev as any as MouseEvent, canvas);
        const { i, j } = canvasXYToCell(x, y, canvas);
        if (dragging.i === i && dragging.j === j) return;

        if (dragging.kind === "agent") {
        sim.moveAgentCell(dragging.i, dragging.j, i, j, { forbidOverlap: true });
        } else {
        sim.moveFoodCell(dragging.i, dragging.j, i, j, { forbidOverlap: true });
        }
        dragging.i = i;
        dragging.j = j;
        refresh();
        ev.preventDefault();
    };

    const onPointerUp = (ev: PointerEvent) => {
        if (!dragging) return;
        dragging = null;
        isDragLockRef.current = false;
        canvas.releasePointerCapture?.(ev.pointerId);
        ev.preventDefault();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
    };
    }, [ready, moveAgentsMode, moveFoodMode, placeStonesMode]);



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
