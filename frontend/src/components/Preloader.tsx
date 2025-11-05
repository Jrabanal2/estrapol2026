import React, { useState, useEffect } from 'react';
import './Preloader.css';

interface PreloaderProps {
  onLoadingComplete?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Preloader más rápido para carga inicial
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsVisible(false);
            onLoadingComplete?.();
          }, 200);
          return 100;
        }
        return prev + 4; // Más rápido
      });
    }, 20); // Intervalo más corto

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="preloader">
      <div className="preloader-content">
        <div className="logo-container">
          <img 
            src="/images/logo.jpg" 
            alt="Logo PNP" 
            className="preloader-logo"
          />
        </div>

        <div className="progress-container">
          <div className="progress-circle">
            <svg className="progress-ring" width="120" height="120">
              <circle
                className="progress-ring-circle"
                stroke="#25d366"
                strokeWidth="4"
                strokeLinecap="round"
                fill="transparent"
                r="52"
                cx="60"
                cy="60"
                style={{
                  strokeDasharray: 326.56,
                  strokeDashoffset: 326.56 - (326.56 * progress) / 100
                }}
              />
            </svg>
            <div className="progress-text">
              {progress}%
            </div>
          </div>
        </div>

        <div className="loading-text">
          <h3>POLICÍA NACIONAL DEL PERÚ</h3>
          <p>ESTRAPOL - Inicializando aplicación...</p>
        </div>
      </div>
    </div>
  );
};

export default Preloader;