import React, { useState, useRef } from 'react';
import { RotateCcw, Palette } from 'lucide-react';

interface CarColor {
  name: string;
  value: string;
  gradient: string;
}

const Car3D: React.FC = () => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const colors: CarColor[] = [
    { name: 'Midnight Black', value: '#0B0B0C', gradient: 'from-gray-900 to-black' },
    { name: 'Carbon Silver', value: '#8B8D94', gradient: 'from-gray-500 to-gray-700' },
    { name: 'Racing Red', value: '#DC2626', gradient: 'from-red-600 to-red-800' },
    { name: 'Electric Blue', value: '#2563EB', gradient: 'from-blue-600 to-blue-800' },
  ];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateX = (e.clientY - centerY) / 10;
    const rotateY = (e.clientX - centerX) / 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsInteracting(false);
  };

  const resetRotation = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* 3D Car Container */}
      <div
        ref={containerRef}
        className="relative w-full h-96 cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: '1000px' }}
      >
        {/* Car Body */}
        <div
          className={`relative w-full h-full transition-transform duration-300 ease-out ${colors[selectedColor].gradient} bg-gradient-to-br rounded-lg shadow-2xl`}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Car Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-80 h-40">
              {/* Main Body */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colors[selectedColor].gradient} rounded-lg shadow-inner`}>
                {/* Windshield */}
                <div className="absolute top-6 left-8 right-8 h-16 bg-black/30 rounded-t-lg backdrop-blur-sm"></div>
                
                {/* Side Windows */}
                <div className="absolute top-8 left-12 w-16 h-8 bg-black/20 rounded"></div>
                <div className="absolute top-8 right-12 w-16 h-8 bg-black/20 rounded"></div>
                
                {/* Wheels */}
                <div className="absolute -bottom-2 left-8 w-12 h-12 bg-dark-graphite rounded-full border-4 border-gray-600"></div>
                <div className="absolute -bottom-2 right-8 w-12 h-12 bg-dark-graphite rounded-full border-4 border-gray-600"></div>
                
                {/* Headlights */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-3 h-6 bg-acid-yellow rounded-r"></div>
                <div className="absolute top-1/2 -translate-y-1/2 right-0 w-3 h-6 bg-red-500 rounded-l"></div>
              </div>
              
              {/* Reflection Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-lg pointer-events-none"></div>
            </div>
          </div>

          {/* Glassmorphism Overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-lg pointer-events-none"></div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={resetRotation}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-sm hover:bg-white/20 transition-colors duration-300"
            aria-label="Reset rotation"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
          
          <button
            className="p-2 bg-white/10 backdrop-blur-sm rounded-sm hover:bg-white/20 transition-colors duration-300"
            aria-label="Color options"
          >
            <Palette className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Color Selector */}
      <div className="mt-6 flex justify-center space-x-3">
        {colors.map((color, index) => (
          <button
            key={color.name}
            onClick={() => setSelectedColor(index)}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
              selectedColor === index 
                ? 'border-acid-yellow scale-110' 
                : 'border-gray-600 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color.value }}
            aria-label={`Select ${color.name}`}
          >
            {selectedColor === index && (
              <div className="w-full h-full rounded-full border-2 border-acid-yellow/50"></div>
            )}
          </button>
        ))}
      </div>

      {/* Color Name */}
      <p className="text-center mt-3 text-gray-400 text-sm font-medium tracking-wider">
        {colors[selectedColor].name.toUpperCase()}
      </p>
    </div>
  );
};

export default Car3D;