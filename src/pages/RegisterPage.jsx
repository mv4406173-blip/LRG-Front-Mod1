import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.password_confirmation);
      toast.success('Cuenta creada. Revisa tu correo para verificarla.');
      navigate('/login');
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) setErrors(data.errors);
      else toast.error(data?.message ?? 'Error al registrarse');
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
          <p>Crea tu cuenta</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Juan García"
              required
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name[0]}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="reg-email">Correo electrónico</label>
            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="tu@correo.com"
              required
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email[0]}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="reg-password">Contraseña</label>
            <div className="input-wrapper">
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Mín. 8 caracteres"
                required
                className={errors.password ? 'error' : ''}
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password[0]}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="password-confirm">Confirmar contraseña</label>
            <input
              id="password-confirm"
              type={showPass ? 'text' : 'password'}
              value={form.password_confirmation}
              onChange={set('password_confirmation')}
              placeholder="Repite la contraseña"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login" className="link-accent">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
