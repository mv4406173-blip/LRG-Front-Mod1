import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Database } from 'lucide-react';
import { api } from '../lib/api';
import useAuthStore from '../store/authStore';

function getVerificationUrl(redirect) {
  if (!redirect?.startsWith('/api/v1/auth/email/verify/')) return null;

  const url = new URL(redirect, window.location.origin);
  const isVerificationPath = /^\/api\/v1\/auth\/email\/verify\/\d+\/[a-f\d]{40}$/i.test(url.pathname);
  const hasValidSignature = /^\d+$/.test(url.searchParams.get('expires') ?? '')
    && /^[a-f\d]{64}$/i.test(url.searchParams.get('signature') ?? '');

  return url.origin === window.location.origin && isVerificationPath && hasValidSignature
    ? `${url.pathname}${url.search}`
    : null;
}

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, init } = useAuthStore();
  const [status, setStatus] = useState('pending');
  const requestStarted = useRef(false);
  const verificationUrl = getVerificationUrl(searchParams.get('redirect'));
  const displayStatus = !verificationUrl
    ? 'invalid'
    : status === 'pending'
      ? 'loading'
      : status;

  useEffect(() => {
    if (isLoading || !verificationUrl || requestStarted.current) return;

    requestStarted.current = true;
    api.get(verificationUrl)
      .then(async () => {
        setStatus('verified');
        if (isAuthenticated) await init();
      })
      .catch(() => setStatus('failed'));
  }, [init, isAuthenticated, isLoading, verificationUrl]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          {displayStatus === 'verified' ? <CheckCircle size={32} strokeWidth={1.5} /> : <Database size={32} strokeWidth={1.5} />}
          <h1>LRG Schema</h1>
          <p>Verificación de correo</p>
        </div>

        {displayStatus === 'loading' && <p>Verificando tu correo...</p>}
        {displayStatus === 'verified' && (
          <>
            <p>Tu correo se verificó correctamente. Ya puedes acceder a tus proyectos.</p>
            <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn-primary">
              {isAuthenticated ? 'Ir al dashboard' : 'Iniciar sesión'}
            </Link>
          </>
        )}
        {(displayStatus === 'invalid' || displayStatus === 'failed') && (
          <>
            <p>El enlace no es válido o expiró. Inicia sesión para solicitar uno nuevo.</p>
            <Link to="/login" className="btn-primary">Iniciar sesión</Link>
          </>
        )}
      </div>
    </div>
  );
}
