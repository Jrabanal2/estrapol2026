import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './LoadingBar.css';

const LoadingBar: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Iniciar loading cuando cambia la ruta
    setIsLoading(true);
    setProgress(0);

    // Simular progreso de carga
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 300);
          return 100;
        }
        return prev + 10; // Ajusta la velocidad aquí
      });
    }, 50); // Más rápido para transiciones

    return () => clearInterval(interval);
  }, [location]);

  if (!isLoading) return null;

  return (
    <div className="loading-bar-container">
      <div 
        className="loading-bar-progress"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default LoadingBar;