import React, { useState } from 'react';
import { Info } from 'lucide-react';
import LineCodingSimulator from './components/LineCodingSimulator';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">
            Line Coding Techniques Simulator
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Info size={20} />
            Simulate 2B1Q and 8B6T line coding with step-by-step visualization
          </p>
        </header>
        
        <LineCodingSimulator />
      </div>
    </div>
  );
}

export default App;