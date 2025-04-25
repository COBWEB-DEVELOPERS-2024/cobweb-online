import React from 'react';
import WebGPUCanvas from './modules/cobwebGrid/components/WebGPUCanvas';
import Navbar from './shared/views/Navbar';

const App: React.FC = () => {
	return (
		<div className="bg-emerald-50 min-h-screen flex flex-col items-center justify-center">
			<Navbar />
			<WebGPUCanvas />
		</div>
	);
};

export default App;
