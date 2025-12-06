import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavbarContextType {
    // Simulation controls
    paused: boolean;
    togglePause: () => void;
    setPaused: (paused: boolean) => void;
    speedFactor: number;
    setSpeedFactor: (factor: number) => void;
    step: boolean;
    enableStep: () => void;
    disableStep: () => void;
    
    // Food mode
    foodMode: boolean;
    toggleFoodMode: () => void;
    setFoodMode: (mode: boolean) => void;
    selectedFoodColor: number;
    setSelectedFoodColor: (color: number) => void;
    
    // Stones mode
    placeStonesMode: boolean;
    togglePlaceStonesMode: () => void;
    setPlaceStonesMode: (mode: boolean) => void;
    
    // Remove all operations
    removeAllFood: boolean;
    setRemoveAllFood: (value: boolean) => void;
    removeAllStones: boolean;
    setRemoveAllStones: (value: boolean) => void;
    removeAllAgents: boolean;
    setRemoveAllAgents: (value: boolean) => void;
    removeAllWaste: boolean;
    setRemoveAllWaste: (value: boolean) => void;
    removeAll: boolean;
    setRemoveAll: (value: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const useNavbar = () => {
    const context = useContext(NavbarContext);
    if (!context) {
        throw new Error('useNavbar must be used within a NavbarProvider');
    }
    return context;
};

interface NavbarProviderProps {
    children: ReactNode;
}

export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
    // Simulation controls
    const [paused, setPaused] = useState(true);
    const [speedFactor, setSpeedFactor] = useState(8);
    const [step, setStep] = useState(true);
    
    // Food mode
    const [foodMode, setFoodMode] = useState(false);
    const [selectedFoodColor, setSelectedFoodColor] = useState(0);
    
    // Stones mode
    const [placeStonesMode, setPlaceStonesMode] = useState(false);
    
    // Remove all operations
    const [removeAllFood, setRemoveAllFood] = useState(false);
    const [removeAllStones, setRemoveAllStones] = useState(false);
    const [removeAllAgents, setRemoveAllAgents] = useState(false);
    const [removeAllWaste, setRemoveAllWaste] = useState(false);
    const [removeAll, setRemoveAll] = useState(false);
    
    const togglePause = () => setPaused(prev => !prev);
    const enableStep = () => setStep(true);
    const disableStep = () => setStep(false);
    const toggleFoodMode = () => setFoodMode(prev => !prev);
    const togglePlaceStonesMode = () => setPlaceStonesMode(prev => !prev);
    
    const value: NavbarContextType = {
        paused,
        togglePause,
        setPaused,
        speedFactor,
        setSpeedFactor,
        step,
        enableStep,
        disableStep,
        foodMode,
        toggleFoodMode,
        setFoodMode,
        selectedFoodColor,
        setSelectedFoodColor,
        placeStonesMode,
        togglePlaceStonesMode,
        setPlaceStonesMode,
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
    };
    
    return (
        <NavbarContext.Provider value={value}>
            {children}
        </NavbarContext.Provider>
    );
};
