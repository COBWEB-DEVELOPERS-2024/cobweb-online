import React from 'react';
import {Button} from '@heroui/react';
import FileNavButton from '../components/FileNavButton';
import EditNavButton from '../components/EditNavButton';
import ViewNavButton from '../components/ViewNavButton';
import SimulationNavButton from '../components/SimulationNavButton';

interface NavbarProps {
    paused: boolean;
    togglePause: () => void;
    enableStep: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ paused, togglePause, enableStep }: NavbarProps) => {
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
                <Button
                    className='text-base bg-white text-emerald-800'
                    onPress={enableStep}
                    isDisabled={!paused}
                > Step </Button>
            </div>

            {/* Right Side - Settings, Views, I/O Buttons */}
            <div className="flex gap-4">
                <FileNavButton />
                <EditNavButton />
                <ViewNavButton />
                <SimulationNavButton />
            </div>
        </nav>
    );
};

export default Navbar;
