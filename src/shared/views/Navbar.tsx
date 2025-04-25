import React from 'react';
import FileNavButton from '../components/FileNavButton';
import EditNavButton from '../components/EditNavButton';
import ViewNavButton from '../components/ViewNavButton';
import SimulationNavButton from '../components/SimulationNavButton';

const Navbar: React.FC = () => {
    return (
        <nav className="w-full p-4 bg-emerald-600 text-emerald-50 flex items-center justify-between shadow-xl">
            {/* Left Side - Logo */}
            <h1 className="text-3xl font-bold">COBWEB</h1>

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
