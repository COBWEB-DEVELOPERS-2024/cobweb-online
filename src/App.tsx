import React from 'react';

const App: React.FC = () => {
  const isWebGPUSupported = () => {
    return 'gpu' in navigator;
  };

  return (
    <div>
      <h1>WebGPU Support Check</h1>
      {isWebGPUSupported() ? (
        <p>Your browser supports WebGPU!</p>
      ) : (
        <p>WebGPU is not supported in your browser.</p>
      )}
    </div>
  );
};

export default App;
