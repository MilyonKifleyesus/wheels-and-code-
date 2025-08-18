import React, { useState, useEffect } from 'react';
import { useRef } from 'react';

interface Spec {
  label: string;
  value: number;
  unit: string;
  duration: number;
}

const SpecTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatedValue, setAnimatedValue] = useState(0);
  const mountedRef = useRef(true);

  const specs: Spec[] = [
    { label: '0-100 KM/H', value: 3.2, unit: 'SEC', duration: 2000 },
    { label: 'MAX POWER', value: 650, unit: 'HP', duration: 2500 },
    { label: 'PEAK TORQUE', value: 850, unit: 'NM', duration: 2300 },
    { label: 'TOP SPEED', value: 320, unit: 'KM/H', duration: 2800 },
  ];

  useEffect(() => {
    mountedRef.current = true;
    const interval = setInterval(() => {
      if (mountedRef.current) {
        setCurrentIndex((prev) => (prev + 1) % specs.length);
      }
    }, 4000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [specs.length]);

  useEffect(() => {
    if (!mountedRef.current) return;
    
    setAnimatedValue(0);
    const currentSpec = specs[currentIndex];
    
    const startTime = Date.now();
    const animate = () => {
      if (!mountedRef.current) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / currentSpec.duration, 1);
      
      // Ease out quad
      const easeProgress = 1 - Math.pow(1 - progress, 2);
      setAnimatedValue(currentSpec.value * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        requestAnimationFrame(animate);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [currentIndex, specs]);

  const currentSpec = specs[currentIndex];

  return (
    <div className="bg-dark-graphite/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 w-full max-w-sm">
      <div className="text-center space-y-4">
        <div className="text-gray-400 text-xs font-medium tracking-widest uppercase">
          {currentSpec.label}
        </div>
        
        <div className="text-4xl sm:text-5xl font-black tracking-tight">
          <span className="text-acid-yellow">
            {currentSpec.value < 10 
              ? animatedValue.toFixed(1) 
              : Math.round(animatedValue).toLocaleString()
            }
          </span>
          <span className="text-white text-2xl ml-2">{currentSpec.unit}</span>
        </div>
        
        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2">
          {specs.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-acid-yellow w-8' 
                  : 'bg-gray-600'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecTicker;