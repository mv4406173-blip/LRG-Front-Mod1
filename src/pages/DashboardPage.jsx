import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, ArrowRight, Upload, Database } from 'lucide-react';
import { projectsApi } from '../lib/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email_verified_at) return;

    projectsApi.list(1).then((res) => {
      setProjects(res.data.data.slice(0, 5));
      setMeta(res.data.meta);
    }).catch((error) => {
      toast.error(error.response?.status === 401
        ? 'Tu sesión expiró. Inicia sesión de nuevo.'
        : error.response?.data?.message ?? 'No se pudieron cargar los proyectos.');
    }).finally(() => setLoading(false));
  }, [user?.email_verified_at]);

  const stats = [
    { label: 'Proyectos totales', value: meta?.total ?? '—', icon: <FolderOpen size={22} />, color: 'stat-blue' },
    { label: 'Verificado', value: user?.email_verified_at ? 'Sí' : 'No', icon: <Database size={22} />, color: user?.email_verified_at ? 'stat-green' : 'stat-orange' },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Bienvenido de vuelta, <strong>{user?.name}</strong></p>
        </div>
        <Link to="/projects/new" className="btn-primary btn-icon">
          <Plus size={16} /> Nuevo proyecto
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-body">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h3 className="section-title">Proyectos recientes</h3>
        <Link to="/projects" className="link-accent">Ver todos <ArrowRight size={14} /></Link>
      </div>

      {!user?.email_verified_at ? (
        <div className="empty-state">
          <Database size={40} strokeWidth={1.2} />
          <p>Verifica tu correo para consultar y administrar tus proyectos.</p>
        </div>
      ) : loading ? (
        <div className="card-grid">
          {[1, 2, 3].map((i) => <div key={i} className="project-card skeleton" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <Upload size={40} strokeWidth={1.2} />
          <p>Aún no tienes proyectos.</p>
          <Link to="/projects/new" className="btn-primary">Crear tu primer proyecto</Link>
        </div>
      ) : (
        <div className="card-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </Layout>
  );
}

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <div className="project-card-header">
        <div className="project-icon"><FolderOpen size={18} /></div>
        <span className={`badge badge-${project.status}`}>{project.status}</span>
      </div>
      <h4 className="project-name">{project.name}</h4>
      <p className="project-desc">{project.description || 'Sin descripción'}</p>
      <div className="project-meta">
        <span>{new Date(project.created_at).toLocaleDateString('es-MX')}</span>
        <ArrowRight size={14} />
      </div>
    </Link>
  );
}
