import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await login(email, password);
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) setErrors(data.errors);
      else toast.error(data?.message ?? 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Database size={32} strokeWidth={1.5} />
          <h1>LRG Schema</h1>
          <p>Gestión de esquemas SQL versionados</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email[0]}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={errors.password ? 'error' : ''}
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password[0]}</span>}
          </div>

          <div className="field-actions">
            <Link to="/forgot-password" className="link-secondary">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/register" className="link-accent">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
