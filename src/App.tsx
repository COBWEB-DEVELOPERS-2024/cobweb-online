import React from 'react';
import WebGPUCanvas from './modules/cobwebGrid/components/WebGPUCanvas';
import Navbar from './shared/views/Navbar';
import { NavbarProvider, useNavbar } from './shared/contexts/NavbarContext';

const AppContent: React.FC = () => {
	const { 
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
		setRemoveAll
	} = useNavbar();

	return (
		<div className="bg-white min-h-screen flex flex-col items-center justify-center">
			<Navbar />
			<WebGPUCanvas 
				paused={paused} 
				speedFactor={speedFactor} 
				step={step} 
				disableStep={disableStep} 
				foodMode={foodMode} 
				selectedFoodColor={selectedFoodColor} 
				placeStonesMode={placeStonesMode}
				removeAllFood={removeAllFood}
				setRemoveAllFood={setRemoveAllFood}
				removeAllStones={removeAllStones}
				setRemoveAllStones={setRemoveAllStones}
				removeAllAgents={removeAllAgents}
				setRemoveAllAgents={setRemoveAllAgents}
				removeAllWaste={removeAllWaste}
				setRemoveAllWaste={setRemoveAllWaste}
				removeAll={removeAll}
				setRemoveAll={setRemoveAll}
			/>
		</div>
	);
};

const App: React.FC = () => {
	return (
		<NavbarProvider>
			<AppContent />
		</NavbarProvider>
	);
};

export default App;
