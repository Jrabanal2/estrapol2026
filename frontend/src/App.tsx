import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Preloader from './components/Preloader';

// Páginas de autenticación
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Páginas principales
import Main from './pages/main/Main';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Precargar recursos importantes
  useEffect(() => {
    let loadedImages = 0;
    const totalImages = 6; // Número de imágenes a precargar

    const imagesToPreload = [
      '/images/logo.jpg',
      '/images/fondoSolo.png',
      '/images/img-balotario.png',
      '/images/logo_transparente.png',
      '/images/img-siecopol.png',
      '/images/img_audio.png'
    ];

    const onImageLoad = () => {
      loadedImages++;
      // Si todas las imágenes están cargadas, marcar como listo
      if (loadedImages === totalImages) {
        setResourcesLoaded(true);
      }
    };

    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = onImageLoad;
      img.onerror = onImageLoad; // También contar errores como "cargados"
    });

    // Timeout de seguridad por si alguna imagen no carga
    const safetyTimeout = setTimeout(() => {
      setResourcesLoaded(true);
    }, 5000); // 5 segundos máximo

    return () => clearTimeout(safetyTimeout);
  }, []);

  // Mostrar preloader mientras carga la aplicación
  if (isLoading) {
    return (
      <Preloader 
        onLoadingComplete={handleLoadingComplete}
        duration={resourcesLoaded ? 1000 : 3000} // Más rápido si los recursos ya cargaron
      />
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<div>Recuperar Contraseña - Próximamente</div>} />

            {/* Rutas protegidas */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/main" element={<Main />} />
                <Route path="/balotario" element={<div>Balotario - Próximamente</div>} />
                <Route path="/examen-temas" element={<div>Exámenes por Temas - Próximamente</div>} />
                <Route path="/siecopol" element={<div>SIECOPOL - Próximamente</div>} />
                <Route path="/audio" element={<div>Audio - Próximamente</div>} />
              </Route>
            </Route>

            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/main" replace />} />
            
            {/* Ruta 404 */}
            <Route path="*" element={
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(to top, rgb(41, 198, 94), rgb(15, 82, 37))',
                color: 'white',
                fontSize: '1.5rem',
                textAlign: 'center'
              }}>
                <div>
                  <h1>404 - Página No Encontrada</h1>
                  <p>La página que buscas no existe.</p>
                  <a 
                    href="/main" 
                    style={{
                      color: '#ffeb3b',
                      textDecoration: 'underline',
                      fontSize: '1.2rem'
                    }}
                  >
                    Volver al Inicio
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;