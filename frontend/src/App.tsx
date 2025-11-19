import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Preloader from './components/Preloader';
import UserManagement from './pages/admin/UserManagement';

// Páginas de autenticación
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Páginas principales
import Main from './pages/main/Main';
import MainTemario from './pages/temario/MainTemario';
import MainBallot from './pages/balotario/MainBallot';
import MainExamTemas from './pages/examenes/MainExamTemas';
import MainSiecopol from './pages/siecopol/MainSiecopol';
import SiecopolExam from './pages/siecopol/SiecopolExam';
import MainAudio from './pages/audio/MainAudio';

// Páginas de detalle y exámenes
import TopicDetail from './pages/balotario/TopicDetail';
import ExamPage from './pages/examenes/ExamPage';
import AudioPage from './pages/audio/AudioPage';

// Páginas de resultados
import ResultPage from './pages/results/ResultPage';
import CorrectErrors from './pages/results/CorrectErrors';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    // Precargar imágenes importantes
    const images = [
      '/images/logo.jpg',
      '/images/fondoSolo.png',
      '/images/img-balotario.png',
      '/images/logo_transparente.png',
      '/images/img-siecopol.png',
      '/images/img_audio.png',
      '/images/img_temario.png'
    ];

    let loadedCount = 0;
    const totalImages = images.length;

    const onImageLoad = () => {
      loadedCount++;
      // Si todas las imágenes están cargadas o ha pasado suficiente tiempo, continuar
      if (loadedCount === totalImages) {
        console.log('✅ Todas las imágenes precargadas');
      }
    };

    images.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = onImageLoad;
      img.onerror = onImageLoad;
    });

    // Timeout de seguridad
    const timer = setTimeout(() => {
      console.log('🔄 Timeout de precarga alcanzado');
      handleLoadingComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Preloader onLoadingComplete={handleLoadingComplete} />;
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
              
                {/* Páginas principales */}
                <Route path="/main" element={<Main />} />
                <Route path="/temario" element={<MainTemario />} />
                
                {/* Balotario */}
                <Route path="/balotario" element={<MainBallot />} />
                <Route path="/balotario/:topicId" element={<TopicDetail />} />
                
                {/* Exámenes por temas */}
                <Route path="/examen-temas" element={<MainExamTemas />} />
                <Route path="/examen-temas/:topicId" element={<ExamPage />} />
                
                {/* SIECOPOL */}
                <Route path="/siecopol" element={<MainSiecopol />} />
                <Route path="/siecopol/examen" element={<SiecopolExam />} />
                
                {/* Audio */}
                <Route path="/audio" element={<MainAudio />} />
                <Route path="/audio/:topicId" element={<AudioPage />} />
                
                {/* Resultados */}
                <Route path="/resultado" element={<ResultPage />} />
                <Route path="/corregir-errores" element={<CorrectErrors />} />
                <Route path="/admin/users" element={<UserManagement />} />
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