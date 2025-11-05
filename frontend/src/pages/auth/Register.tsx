import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import WhatsAppChat from '../../components/WhatsAppChat';
import type { RegisterForm } from '../../types';
import { GRADE_OPTIONS } from '../../types';
import './Register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    grade: 'SB',
    username: '',
    phone: '',
    mail: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.username.trim()) {
      setError('El nombre y apellidos son obligatorios');
      return;
    }

    if (!formData.phone.trim()) {
      setError('El número de teléfono es obligatorio');
      return;
    }

    if (!formData.mail.trim()) {
      setError('El correo electrónico es obligatorio');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    console.log('📝 Datos del formulario:', formData);

    try {
      const result = await register(formData);
      
      if (result.success) {
        alert('Usuario registrado exitosamente');
        navigate('/login');
      } else {
        setError(result.message || 'Error al registrar usuario');
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('❌ Error en handleSubmit:', error);
      setError(error.message || 'Error inesperado al registrar usuario');
    }
  };

  return (
    <div className='registro-usuario'>
      <div className='imgFondo'>
        <img src="/images/fondoSolo.png" alt='Fondo policial' />
      </div>
      
      <form onSubmit={handleSubmit} className="register-form">
        <div className="register-header">
          <img src='/images/logo.jpg' alt='Logo PNP' />
          <h3>ESTUDIO ESTRATÉGICO POLICIAL</h3>
          <h4>Suboficiales de Armas</h4>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Fila 1: Grado + Nombre + Teléfono */}
        <div className="form-row">
          <div className="form-group grade-group">
            <select
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              {GRADE_OPTIONS.map(grade => (
                <option key={grade} value={grade}>{grade} PNP</option>
              ))}
            </select>
          </div>

          <div className="form-group name-group">
            <input
              type="text"
              name="username"
              placeholder='NOMBRES Y APELLIDOS'
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group phone-group">
            <input
              type="tel"
              name="phone"
              placeholder='NÚMERO DE TELÉFONO'
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Fila 2: Correo electrónico */}
        <div className="form-group email-group">
          <input
            type="email"
            name="mail"
            placeholder='CORREO ELECTRÓNICO'
            value={formData.mail}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        {/* Fila 3: Contraseña + Confirmar Contraseña */}
        <div className="form-row password-row">
          <div className="form-group password-input-container password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder='CONTRASEÑA (Mínimo 8 caracteres)'
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="form-group password-input-container confirm-password-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder='CONFIRMAR CONTRASEÑA'
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={8}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="register-button"
          disabled={isLoading}
        >
          {isLoading ? 'REGISTRANDO...' : 'REGISTRAR'}
        </button>

        <div className="login-link">
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
        </div>
      </form>

      <WhatsAppChat />
    </div>
  );
};

export default Register;