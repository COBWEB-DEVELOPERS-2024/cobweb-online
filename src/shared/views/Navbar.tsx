import React from 'react';
import {Button, Slider } from '@heroui/react';
import FileNavButton from '../components/FileNavButton';
import EditNavButton from '../components/EditNavButton';
import ViewNavButton from '../components/ViewNavButton';
import SimulationNavButton from '../components/SimulationNavButton';

interface NavbarProps {
    paused: boolean;
    togglePause: () => void;
    speedFactor: number;
    setSpeedFactor: (factor: number) => void;
    enableStep: () => void;
    foodMode: boolean;
    toggleFoodMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ paused, togglePause, speedFactor, setSpeedFactor, enableStep, foodMode, toggleFoodMode }: NavbarProps) => {
    function handleSpeedChange(value: number | number[]) {
        if (Array.isArray(value)) {
            setSpeedFactor(value[0]);
        } else {
            setSpeedFactor(value);
        }
    }

    return (
        <nav className="w-full p-4 bg-emerald-600 text-white flex items-center justify-between shadow-xl">
            {/* Left Side - Logo */}
            <h1 className="text-3xl font-bold"> COBWEB </h1>

            {/* Middle - Play/Pause Button */}
            <div className="flex gap-4">
                <Button
                    className='text-base bg-white text-emerald-800'
                    onPress={togglePause}
                > {paused ? 'Play' : 'Pause'} </Button>
                <Slider
                    className='w-40 justify-center'
                    color='primary'
                    classNames={{thumb: 'bg-emerald-800'}}
                    onChange={handleSpeedChange}
                    minValue={4}
                    maxValue={20}
                    step={4}
                    defaultValue={speedFactor}
                    isDisabled={!paused}
                    showSteps={true}
                    size='lg'
                />
                <Button
                    className='text-base bg-white text-emerald-800'
                    onPress={enableStep}
                    isDisabled={!paused}
                > Step </Button>
            </div>

            {/* Right Side - Settings, Views, I/O Buttons */}
            <div className="flex gap-4">
                <FileNavButton />
                <EditNavButton foodMode={foodMode} toggleFoodMode={toggleFoodMode} />
                <ViewNavButton />
                <SimulationNavButton />
            </div>
        </nav>
    );
};

export default Navbar;
