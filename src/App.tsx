import React from 'react';
import WebGPUCanvas from './modules/cobwebGrid/components/WebGPUCanvas';
import Navbar from './shared/views/Navbar';

const App: React.FC = () => {
	return (
		<div className="bg-white min-h-screen flex flex-col items-center justify-center">
			<Navbar />
			<WebGPUCanvas />
		</div>
	);
};

export default App;
