import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import WhatsAppChat from '../../components/WhatsAppChat';
import type { LoginForm } from '../../types';
import './Login.css';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({ 
    mail: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await login(formData);
    
    if (result.success) {
      navigate('/main');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='conteiner1'>
      <div className='imgFondo'>
        <img src="/images/fondoSolo.png" alt='Fondo policial' />
      </div>
      
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-header">
          <img src='/images/logo.jpg' alt='Logo PNP' />
          <h1>POLICÍA NACIONAL DEL PERÚ</h1>
          <h3>ESTUDIO ESTRATÉGICO POLICIAL</h3>
          <h4>Suboficiales de Armas</h4>
        </div>

        <div className="form-group">
          <input
            type="email"
            name="mail"
            placeholder='USUARIO'
            value={formData.mail}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder='CONTRASEÑA'
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <button 
            type="button" 
            className="password-toggle"
            onClick={togglePasswordVisibility}
            disabled={isLoading}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="form-options">
          <a href="/forgot-password" className="forgot-password">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? 'INGRESANDO...' : 'INGRESAR'}
        </button>

        <div className="register-link">
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </div>
      </form>

      <WhatsAppChat />
    </div>
  );
};

export default Login;