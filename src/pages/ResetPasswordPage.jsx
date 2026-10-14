import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Database, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../lib/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: params.get('email') ?? '',
    password: '',
    password_confirmation: '',
    token: params.get('token') ?? '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await authApi.resetPassword(form);
      toast.success('Contraseña restablecida correctamente');
      navigate('/login');
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) setErrors(data.errors);
      else toast.error(data?.message ?? 'Error al restablecer');
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
          <p>Nueva contraseña</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="reset-email">Correo electrónico</label>
            <input
              id="reset-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email[0]}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="new-password">Nueva contraseña</label>
            <div className="input-wrapper">
              <input
                id="new-password"
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
            <label htmlFor="confirm-new-password">Confirmar contraseña</label>
            <input
              id="confirm-new-password"
              type={showPass ? 'text' : 'password'}
              value={form.password_confirmation}
              onChange={set('password_confirmation')}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Restablecer contraseña'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login" className="link-secondary">Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
