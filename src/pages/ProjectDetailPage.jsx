import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, RefreshCw, ChevronLeft, ChevronRight,
  Database, AlertCircle, CheckCircle, Clock, Loader, Trash2, Pencil, X, Check,
} from 'lucide-react';
import { projectsApi, importsApi, artifactsApi } from '../lib/api';
import Layout from '../components/Layout';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const STATUS_ICONS = {
  queued:     <Clock size={14} />,
  processing: <Loader size={14} className="spin" />,
  completed:  <CheckCircle size={14} />,
  failed:     <AlertCircle size={14} />,
  retrying:   <RefreshCw size={14} className="spin" />,
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tab, setTab] = useState('imports');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [deleting, setDeleting] = useState(false);

  // Imports state
  const [imports, setImports] = useState([]);
  const [importsMeta, setImportsMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [importsPage, setImportsPage] = useState(1);
  const [importsLoading, setImportsLoading] = useState(false);
  const [selectedImport, setSelectedImport] = useState(null);
  const pollingRef = useRef(null);

  // Artifacts state
  const [artifacts, setArtifacts] = useState([]);
  const [artifactsMeta, setArtifactsMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [artifactsPage, setArtifactsPage] = useState(1);
  const [artifactsLoading, setArtifactsLoading] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [dialect, setDialect] = useState('mysql');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const authErrorShown = useRef(false);

  const handleRequestError = useCallback((error, fallbackMessage) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
      if (!authErrorShown.current) {
        authErrorShown.current = true;
        toast.error('Tu sesión expiró. Inicia sesión de nuevo.');
      }
      return;
    }

    toast.error(error.response?.data?.message ?? fallbackMessage);
  }, []);

  const fetchProject = useCallback(() => {
    projectsApi.get(id)
      .then((res) => {
        setProject(res.data.data);
        setEditForm({ name: res.data.data.name, description: res.data.data.description ?? '' });
      })
      .catch((error) => handleRequestError(error, 'Proyecto no encontrado'))
      .finally(() => setLoading(false));
  }, [handleRequestError, id]);

  const fetchImports = useCallback((p = 1) => {
    setImportsLoading(true);
    importsApi.list(id, p)
      .then((res) => {
        setImports(res.data.data);
        setImportsMeta(res.data.meta);
        setImportsPage(p);
      })
      .catch((error) => handleRequestError(error, 'No se pudieron cargar las importaciones.'))
      .finally(() => setImportsLoading(false));
  }, [handleRequestError, id]);

  const fetchArtifacts = useCallback((p = 1) => {
    setArtifactsLoading(true);
    artifactsApi.list(id, p)
      .then((res) => {
        setArtifacts(res.data.data);
        setArtifactsMeta(res.data.meta);
        setArtifactsPage(p);
      })
      .catch((error) => handleRequestError(error, 'No se pudieron cargar los artefactos.'))
      .finally(() => setArtifactsLoading(false));
  }, [handleRequestError, id]);

  useEffect(() => {
    fetchProject();
    fetchImports(1);
    fetchArtifacts(1);
  }, [fetchProject, fetchImports, fetchArtifacts]);

  // Polling for in-progress imports
  useEffect(() => {
    const hasActive = imports.some((i) => ['queued', 'processing', 'retrying'].includes(i.status));
    if (hasActive && !pollingRef.current) {
      pollingRef.current = setInterval(() => fetchImports(importsPage), 3000);
    } else if (!hasActive && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      fetchArtifacts(1);
    }
    return () => {};
  }, [imports, importsPage, fetchImports, fetchArtifacts]);

  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  // Drag & Drop
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };
    const enter = () => el.classList.add('drag-over');
    const leave = () => el.classList.remove('drag-over');
    const drop = (e) => {
      e.preventDefault();
      el.classList.remove('drag-over');
      const f = e.dataTransfer.files[0];
      if (f?.name.endsWith('.sql')) setUploadFile(f);
      else toast.error('Solo se aceptan archivos .sql');
    };
    el.addEventListener('dragover', prevent);
    el.addEventListener('dragenter', enter);
    el.addEventListener('dragleave', leave);
    el.addEventListener('drop', drop);
    return () => {
      el.removeEventListener('dragover', prevent);
      el.removeEventListener('dragenter', enter);
      el.removeEventListener('dragleave', leave);
      el.removeEventListener('drop', drop);
    };
  }, []);

  const handleUpload = async () => {
    if (!uploadFile) return;
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('dialect', dialect);
    setUploading(true);
    try {
      await importsApi.upload(id, fd);
      toast.success('Importación iniciada');
      setUploadFile(null);
      fetchImports(1);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = async (importId) => {
    try {
      await importsApi.retry(id, importId);
      toast.success('Reintento iniciado');
      fetchImports(importsPage);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'No se puede reintentar');
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await projectsApi.update(id, editForm);
      setProject(res.data.data);
      setEditing(false);
      toast.success('Proyecto actualizado');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al actualizar');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Archivar este proyecto? Ya no aceptará nuevas importaciones.')) return;
    setDeleting(true);
    try {
      await projectsApi.delete(id);
      toast.success('Proyecto archivado');
      navigate('/projects');
    } catch {
      toast.error('Error al archivar');
      setDeleting(false);
    }
  };

  const handleImportClick = async (imp) => {
    try {
      const res = await importsApi.get(id, imp.id);
      setSelectedImport(res.data.data);
    } catch {
      toast.error('Error al cargar detalles');
    }
  };

  const handleArtifactClick = async (art) => {
    try {
      const res = await artifactsApi.get(id, art.id);
      setSelectedArtifact(res.data.data);
    } catch {
      toast.error('Error al cargar artefacto');
    }
  };

  if (loading) {
    return <Layout><div className="loading-screen"><div className="spinner" /></div></Layout>;
  }

  if (!project) {
    return (
      <Layout>
        <div className="empty-state">
          <p>Proyecto no encontrado.</p>
          <Link to="/projects" className="btn-primary">Volver</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="page-header">
        <div>
          <Link to="/projects" className="back-link link-secondary">
            <ArrowLeft size={16} /> Proyectos
          </Link>
          {editing ? (
            <div className="inline-edit">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="edit-title-input"
              />
              <button className="btn-ghost btn-icon btn-sm" onClick={handleUpdate}><Check size={16} /></button>
              <button className="btn-ghost btn-icon btn-sm" onClick={() => setEditing(false)}><X size={16} /></button>
            </div>
          ) : (
            <div className="title-row">
              <h2 className="page-title">{project.name}</h2>
              <span className={`badge badge-${project.status}`}>{project.status}</span>
            </div>
          )}
          {editing ? (
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              className="edit-desc-input"
              rows={2}
              placeholder="Descripción..."
            />
          ) : (
            <p className="page-subtitle">{project.description || 'Sin descripción'}</p>
          )}
        </div>
        <div className="header-actions">
          {project.status !== 'archived' && (
            <button className="btn-ghost btn-icon" onClick={() => setEditing(!editing)} title="Editar">
              <Pencil size={16} />
            </button>
          )}
          {project.status !== 'archived' && (
            <button className="btn-danger btn-icon" onClick={handleDelete} disabled={deleting} title="Archivar">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      {project.status !== 'archived' && (
        <div className="upload-section">
          <div className="upload-zone" ref={dropRef} onClick={() => fileInputRef.current?.click()}>
            <Upload size={24} strokeWidth={1.5} />
            {uploadFile
              ? <span className="upload-filename">{uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)</span>
              : <span>Arrastra un <code>.sql</code> aquí o haz clic para seleccionar</span>
            }
            <input
              ref={fileInputRef}
              type="file"
              accept=".sql"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) setUploadFile(f);
              }}
            />
          </div>
          <div className="upload-controls">
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="dialect-select"
            >
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="sqlite">SQLite</option>
              <option value="sqlserver">SQL Server</option>
            </select>
            <button
              className="btn-primary btn-icon"
              onClick={handleUpload}
              disabled={!uploadFile || uploading}
            >
              {uploading ? <span className="btn-spinner" /> : <><Upload size={15} /> Importar</>}
            </button>
            {uploadFile && (
              <button className="btn-ghost" onClick={() => setUploadFile(null)}>
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'imports' ? 'active' : ''}`} onClick={() => setTab('imports')}>
          Importaciones ({importsMeta.total})
        </button>
        <button className={`tab ${tab === 'artifacts' ? 'active' : ''}`} onClick={() => setTab('artifacts')}>
          Artefactos ({artifactsMeta.total})
        </button>
      </div>

      {/* Imports Tab */}
      {tab === 'imports' && (
        <div>
          {importsLoading ? (
            <div className="table-skeleton" />
          ) : imports.length === 0 ? (
            <div className="empty-state">
              <Upload size={36} strokeWidth={1.3} />
              <p>Aún no hay importaciones.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Archivo</th>
                    <th>Dialecto</th>
                    <th>Estado</th>
                    <th>Errores/Avisos</th>
                    <th>Versión</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {imports.map((imp) => (
                    <tr key={imp.id} className="table-row clickable" onClick={() => handleImportClick(imp)}>
                      <td className="file-cell">
                        <span className="file-icon">SQL</span>
                        <span>{imp.original_filename}</span>
                      </td>
                      <td><span className="dialect-badge">{imp.dialect}</span></td>
                      <td>
                        <span className={`status-badge status-${imp.status}`}>
                          {STATUS_ICONS[imp.status]} {imp.status}
                        </span>
                      </td>
                      <td>
                        {imp.diagnostics.errors > 0 && (
                          <span className="diag-error">{imp.diagnostics.errors} err</span>
                        )}
                        {imp.diagnostics.warnings > 0 && (
                          <span className="diag-warning">{imp.diagnostics.warnings} aviso</span>
                        )}
                        {imp.diagnostics.errors === 0 && imp.diagnostics.warnings === 0 && (
                          <span className="diag-ok">—</span>
                        )}
                      </td>
                      <td>{imp.artifact_version ? `v${imp.artifact_version}` : '—'}</td>
                      <td>{new Date(imp.created_at).toLocaleString('es-MX')}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {imp.status === 'failed' && (
                          <button
                            className="btn-ghost btn-icon btn-sm"
                            onClick={() => handleRetry(imp.id)}
                            title="Reintentar"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {importsMeta.last_page > 1 && (
            <div className="pagination">
              <button className="btn-ghost btn-icon" disabled={importsPage === 1} onClick={() => fetchImports(importsPage - 1)}>
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className="page-info">Página {importsPage} de {importsMeta.last_page}</span>
              <button className="btn-ghost btn-icon" disabled={importsPage === importsMeta.last_page} onClick={() => fetchImports(importsPage + 1)}>
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Artifacts Tab */}
      {tab === 'artifacts' && (
        <div>
          {artifactsLoading ? (
            <div className="table-skeleton" />
          ) : artifacts.length === 0 ? (
            <div className="empty-state">
              <Database size={36} strokeWidth={1.3} />
              <p>No hay artefactos generados aún.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Versión</th>
                    <th>Formato</th>
                    <th>Tablas</th>
                    <th>Relaciones</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {artifacts.map((art) => (
                    <tr key={art.id} className="table-row clickable" onClick={() => handleArtifactClick(art)}>
                      <td><span className="version-badge">v{art.version}</span></td>
                      <td>{art.format_name} {art.format_version}</td>
                      <td>{art.table_count}</td>
                      <td>{art.relationship_count}</td>
                      <td>{art.created_at ? new Date(art.created_at).toLocaleString('es-MX') : '—'}</td>
                      <td>
                        <button className="btn-ghost btn-icon btn-sm">Ver detalles</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {artifactsMeta.last_page > 1 && (
            <div className="pagination">
              <button className="btn-ghost btn-icon" disabled={artifactsPage === 1} onClick={() => fetchArtifacts(artifactsPage - 1)}>
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className="page-info">Página {artifactsPage} de {artifactsMeta.last_page}</span>
              <button className="btn-ghost btn-icon" disabled={artifactsPage === artifactsMeta.last_page} onClick={() => fetchArtifacts(artifactsPage + 1)}>
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Import Detail Modal */}
      {selectedImport && (
        <Modal title={`Importación: ${selectedImport.original_filename}`} onClose={() => setSelectedImport(null)}>
          <div className="detail-grid">
            <DetailRow label="Estado">
              <span className={`status-badge status-${selectedImport.status}`}>
                {STATUS_ICONS[selectedImport.status]} {selectedImport.status}
              </span>
            </DetailRow>
            <DetailRow label="Dialecto">{selectedImport.dialect}</DetailRow>
            <DetailRow label="Tamaño">{(selectedImport.file_size_bytes / 1024).toFixed(2)} KB</DetailRow>
            <DetailRow label="Intentos">{selectedImport.attempt_count}</DetailRow>
            <DetailRow label="Versión">{selectedImport.artifact_version ? `v${selectedImport.artifact_version}` : '—'}</DetailRow>
            <DetailRow label="En cola">{selectedImport.queued_at ? new Date(selectedImport.queued_at).toLocaleString('es-MX') : '—'}</DetailRow>
            <DetailRow label="Iniciado">{selectedImport.started_at ? new Date(selectedImport.started_at).toLocaleString('es-MX') : '—'}</DetailRow>
            <DetailRow label="Terminado">{selectedImport.finished_at ? new Date(selectedImport.finished_at).toLocaleString('es-MX') : '—'}</DetailRow>
          </div>
          {selectedImport.diagnostics_detail?.length > 0 && (
            <div className="diagnostics-list">
              <h4>Diagnósticos</h4>
              {selectedImport.diagnostics_detail.map((d) => (
                <div key={d.id} className={`diag-item diag-item-${d.severity}`}>
                  <span className="diag-severity">{d.severity}</span>
                  <span className="diag-code">[{d.code}]</span>
                  <span className="diag-msg">{d.message}</span>
                  {d.source_location && <span className="diag-loc">línea {d.source_location}</span>}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Artifact Detail Modal */}
      {selectedArtifact && (
        <Modal title={`Artefacto v${selectedArtifact.version}`} onClose={() => setSelectedArtifact(null)}>
          <div className="detail-grid">
            <DetailRow label="Formato">{selectedArtifact.format_name} {selectedArtifact.format_version}</DetailRow>
            <DetailRow label="Parser">{selectedArtifact.parser_version}</DetailRow>
            <DetailRow label="Tablas">{selectedArtifact.table_count}</DetailRow>
            <DetailRow label="Relaciones">{selectedArtifact.relationship_count}</DetailRow>
            <DetailRow label="SHA-256"><code className="sha-code">{selectedArtifact.artifact_sha256}</code></DetailRow>
          </div>
          {selectedArtifact.schema_document?.tables?.length > 0 && (
            <div className="schema-tables">
              <h4>Tablas detectadas</h4>
              <div className="table-chips">
                {selectedArtifact.schema_document.tables.map((t, i) => (
                  <span key={i} className="table-chip">{t.name ?? t}</span>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </Layout>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{children}</span>
    </div>
  );
}
