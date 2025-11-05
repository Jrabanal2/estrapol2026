import React from 'react';
import './Preloader.css'; // Reutiliza los mismos estilos

const QuickPreloader: React.FC = () => {
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
        
        <div className="loading-text">
          <h3>POLICÍA NACIONAL DEL PERÚ</h3>
          <p>Verificando autenticación...</p>
        </div>
        
        {/* Spinner simple en lugar de progreso */}
        <div className="progress-container">
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
};

export default QuickPreloader;