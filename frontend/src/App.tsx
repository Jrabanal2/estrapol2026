import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Páginas de autenticación
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Páginas principales
import Main from './pages/main/Main';

function App() {
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
            <Route path="*" element={<div>Página no encontrada</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;