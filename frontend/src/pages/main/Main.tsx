import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Main.css';

const Main: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className='dashboard-container'>
      <div className='background-image'>
        <img src="/images/fondoSolo.png" alt='Fondo policial' />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Bienvenido! <span>{user.username}</span></h1>
          <button onClick={logout} style={{
            background: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            Cerrar Sesión
          </button>
        </div>

        <div className="temporizador">
          <h2>Próximamente: Temporizador y Módulos</h2>
          <p>Estamos migrando el dashboard completo...</p>
        </div>

        <div className="modules-grid">
          <Link to="/balotario" className="module-card">
            <img src='/images/img-balotario.png' alt='Balotario' />
            <span>BALOTARIO DIDÁCTICO</span>
          </Link>

          <Link to="/examen-temas" className="module-card">
            <img src='/images/logo_transparente.png' alt='Exámenes' />
            <span>EXÁMENES POR TEMAS</span>
          </Link>

          <Link to="/siecopol" className="module-card">
            <img src='/images/img-siecopol.png' alt='SIECOPOL' />
            <span>EXAMEN TIPO SIECOPOL</span>
          </Link>

          <Link to="/audio" className="module-card">
            <img src='/images/img_audio.png' alt='Audio' />
            <span>BALOTARIO VERSIÓN AUDIO</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Main;