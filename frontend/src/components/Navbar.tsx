import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/auth';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  return (
    <div className="main-nav">
      <div className="menu-container">
        <Link to="/main" className="logo" onClick={closeMenu}>
          <img className="logo-ico" src="/images/favicon.ico" alt="logo" />
        </Link>
        
        <input 
          type="checkbox" 
          id="menu-toggle" 
          checked={isMenuOpen}
          onChange={toggleMenu}
        />
        
        <label htmlFor="menu-toggle" className="menu-button">
          <img src="/images/menu-icon.png" className="menu-icon" alt="Menú" />
        </label>
        
        <nav className={`navbar ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><Link to="/main" onClick={closeMenu}>INICIO</Link></li>
            <li><Link to="/temario" onClick={closeMenu}>TEMARIO</Link></li>
            <li><Link to="/balotario" onClick={closeMenu}>BALOTARIO DIDÁCTICO</Link></li>
            <li><Link to="/examen-temas" onClick={closeMenu}>EXÁMENES POR TEMA</Link></li>
            <li><Link to="/siecopol" onClick={closeMenu}>EXAMEN SIECOPOL</Link></li>
            <li><Link to="/audio" onClick={closeMenu}>VERSIÓN AUDIO</Link></li>
            
            {/* Enlace de Administración solo para usuarios admin */}
            {user?.role === 'admin' && (
              <li><Link to="/admin/users" onClick={closeMenu}>ADMINISTRACIÓN</Link></li>
            )}
            
            <li><button onClick={handleLogout} className="logout-button">CERRAR SESIÓN</button></li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;