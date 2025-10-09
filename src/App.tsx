import React from 'react';
import WebGPUCanvas from './modules/cobwebGrid/components/WebGPUCanvas';
import Navbar from './shared/views/Navbar';

const App: React.FC = () => {
	const [paused, setPaused] = React.useState(true);
	const [speedFactor, setSpeedFactor] = React.useState(8);
	const [step, setStep] = React.useState(true);
	const [foodMode, setFoodMode] = React.useState(false);
	const [selectedFoodColor, setSelectedFoodColor] = React.useState(0);
	// default food color is red (index 0)
	const [removeAllFood, setRemoveAllFood] = React.useState(false);

	const togglePause = () => setPaused(!paused);
	const enableStep = () => setStep(true);
	const disableStep = () => setStep(false);
	const toggleFoodMode = () => setFoodMode(!foodMode);
	// TODO add the rest of the remove functions

	return (
		<div className="bg-white min-h-screen flex flex-col items-center justify-center">
			<Navbar 
				paused={paused} 
				togglePause={togglePause} 
				speedFactor={speedFactor} 
				setSpeedFactor={setSpeedFactor} 
				enableStep={enableStep} 
				foodMode={foodMode} 
				toggleFoodMode={toggleFoodMode} 
				selectedFoodColor={selectedFoodColor} 
				setSelectedFoodColor={setSelectedFoodColor}
				removeAllFood={removeAllFood}
				setRemoveAllFood={setRemoveAllFood}
			/>
			<WebGPUCanvas 
			paused={paused} 
			speedFactor={speedFactor} 
			step={step} 
			disableStep={disableStep} 
			foodMode={foodMode} 
			selectedFoodColor={selectedFoodColor} 
			removeAllFood={removeAllFood}
			setRemoveAllFood={setRemoveAllFood}
			// TODO add the rest of the remove functions
			/>
		</div>
	);
};

export default App;
