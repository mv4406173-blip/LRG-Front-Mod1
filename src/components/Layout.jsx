import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, LogOut, Database, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Error al cerrar sesión');
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Database size={22} strokeWidth={1.8} />
          <span>LRG Schema</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
            <ChevronRight size={14} className="nav-arrow" />
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FolderOpen size={18} />
            <span>Proyectos</span>
            <ChevronRight size={14} className="nav-arrow" />
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() ?? 'U'}</div>
            <div className="user-meta">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        {!user?.email_verified_at && (
          <div className="verification-banner">
            <span>⚠️ Tu correo no está verificado. Algunas funciones estarán limitadas.</span>
            <VerifyBtn />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

function VerifyBtn() {
  const { sendVerification } = useAuthStore();
  const handle = async () => {
    try {
      await sendVerification();
      toast.success('Enlace de verificación enviado');
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'No se pudo enviar el enlace');
    }
  };
  return (
    <button className="btn-verify" onClick={handle}>
      Reenviar verificación
    </button>
  );
}
