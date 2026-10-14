import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { projectsApi } from '../lib/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Generar slug desde el nombre
    const slug = form.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    try {
      const res = await projectsApi.create({ ...form, slug });
      toast.success('Proyecto creado');
      navigate(`/projects/${res.data.data.id}`);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) setErrors(data.errors);
      else toast.error(data?.message ?? 'Error al crear proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <Link to="/projects" className="back-link link-secondary">
            <ArrowLeft size={16} /> Proyectos
          </Link>
          <h2 className="page-title">Nuevo proyecto</h2>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="proj-name">Nombre del proyecto</label>
            <input
              id="proj-name"
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Mi esquema de base de datos"
              required
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name[0]}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="proj-desc">Descripción <span className="label-optional">(opcional)</span></label>
            <textarea
              id="proj-desc"
              value={form.description}
              onChange={set('description')}
              placeholder="Describe el propósito del proyecto..."
              rows={4}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="field-error">{errors.description[0]}</span>}
          </div>

          <div className="form-actions">
            <Link to="/projects" className="btn-ghost">Cancelar</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
