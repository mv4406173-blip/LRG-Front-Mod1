import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, ArrowLeft } from 'lucide-react';
import { authApi } from '../lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Enlace enviado si el correo existe');
    } catch {
      toast.error('Error al enviar el enlace');
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
          <p>Recuperar contraseña</p>
        </div>

        {sent ? (
          <div className="success-box">
            <p>Si existe una cuenta con ese correo, recibirás un enlace de recuperación en breve.</p>
            <Link to="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}>
              Volver al inicio
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <p className="auth-hint">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div className="field-group">
              <label htmlFor="forgot-email">Correo electrónico</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Enviar enlace'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login" className="link-secondary back-link">
            <ArrowLeft size={14} /> Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
