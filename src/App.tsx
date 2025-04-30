import React from 'react';
import WebGPUCanvas from './modules/cobwebGrid/components/WebGPUCanvas';
import Navbar from './shared/views/Navbar';

const App: React.FC = () => {
	const [paused, setPaused] = React.useState(true);
	const [step, setStep] = React.useState(true);

	const togglePause = () => setPaused(!paused);
	const enableStep = () => setStep(true);
	const disableStep = () => setStep(false);

	return (
		<div className="bg-white min-h-screen flex flex-col items-center justify-center">
			<Navbar paused={paused} togglePause={togglePause} enableStep={enableStep} />
			<WebGPUCanvas paused={paused} step={step} disableStep={disableStep} />
		</div>
	);
};

export default App;
