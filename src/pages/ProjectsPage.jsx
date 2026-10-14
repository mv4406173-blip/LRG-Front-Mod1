import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { projectsApi } from '../lib/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProjects = (p = 1) => {
    setLoading(true);
    projectsApi.list(p)
      .then((res) => {
        setProjects(res.data.data);
        setMeta(res.data.meta);
        setPage(p);
      })
      .catch(() => toast.error('Error al cargar proyectos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(1); }, []);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h2 className="page-title">Proyectos</h2>
          <p className="page-subtitle">{meta.total} proyectos en total</p>
        </div>
        <Link to="/projects/new" className="btn-primary btn-icon">
          <Plus size={16} /> Nuevo proyecto
        </Link>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="card-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="project-card skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={40} strokeWidth={1.2} />
          <p>{search ? 'Sin resultados para tu búsqueda.' : 'Aún no tienes proyectos.'}</p>
          {!search && <Link to="/projects/new" className="btn-primary">Crear proyecto</Link>}
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {meta.last_page > 1 && (
        <div className="pagination">
          <button
            className="btn-ghost btn-icon"
            disabled={page === 1}
            onClick={() => fetchProjects(page - 1)}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="page-info">Página {page} de {meta.last_page}</span>
          <button
            className="btn-ghost btn-icon"
            disabled={page === meta.last_page}
            onClick={() => fetchProjects(page + 1)}
          >
            Siguiente <ChevronRight size={16} />
          </button>
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
      <p className="project-slug">/{project.slug}</p>
      <p className="project-desc">{project.description || 'Sin descripción'}</p>
      <div className="project-meta">
        <span>{new Date(project.created_at).toLocaleDateString('es-MX')}</span>
        <ArrowRight size={14} />
      </div>
    </Link>
  );
}
