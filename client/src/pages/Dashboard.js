import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI } from '../services/api';
import { isProjectOwner } from '../utils/auth';
import * as S from '../styles/shared';

// ─── tiny helpers ────────────────────────────────────────────────────────────
const Col = ({ children, style }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:0, ...style }}>{children}</div>
);

const Row = ({ children, style }) => (
  <div style={{ display:'flex', alignItems:'center', ...style }}>{children}</div>
);

export const Dashboard = () => {
  const [projects, setProjects]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [showForm, setShowForm]               = useState(false);
  const [formData, setFormData]               = useState({ name:'', description:'' });
  const [selectedFiles, setSelectedFiles]     = useState([]);
  const [focused, setFocused]                 = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectsAPI.getAll();
      setProjects(res.data);
    } catch { setError('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) { setError('Maximum 5 files allowed'); return; }
    setSelectedFiles(files);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      selectedFiles.forEach(f => fd.append('attachments', f));
      await projectsAPI.create(fd);
      setFormData({ name:'', description:'' });
      setSelectedFiles([]);
      setShowForm(false);
      setError('');
      fetchProjects();
    } catch { setError('Failed to create project'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try { await projectsAPI.delete(id); fetchProjects(); }
    catch { setError('Failed to delete project'); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return (
    <div style={{ ...S.appPage, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:S.color.appMuted }}>Loading…</p>
    </div>
  );

  return (
    <div style={S.appPage}>
      {/* ── Header ── */}
      <header style={S.appHeader}>
        <div style={S.appHeaderInner}>
          <span style={{ fontSize:'18px', fontWeight:700, color:S.color.appText }}>
            Project Manager
          </span>
          <Row style={{ gap:'12px' }}>
            <div style={{ ...S.avatar(32), flexShrink:0 }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span style={{ fontSize:'14px', color:S.color.appMuted }}>{user?.name}</span>
            <button
              onClick={handleLogout}
              style={{ ...S.appBtn('danger'), padding:'7px 14px', fontSize:'13px' }}
            >
              Logout
            </button>
          </Row>
        </div>
      </header>

      <main style={S.appMain}>
        {error && <div style={{ ...S.alertBox('error'), background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626', marginBottom:'1.5rem' }}>{error}</div>}

        {/* ── Section header ── */}
        <Row style={{ justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <h2 style={S.appTitle}>Your projects</h2>
          <button onClick={() => setShowForm(!showForm)} style={S.appBtn('primary')}>
            {showForm ? 'Cancel' : '+ New project'}
          </button>
        </Row>

        {/* ── New project form ── */}
        {showForm && (
          <div style={{ ...S.appCard, marginBottom:'1.5rem' }}>
            <h3 style={{ ...S.appSubtitle, marginBottom:'1.25rem' }}>Create new project</h3>
            <form onSubmit={handleCreateProject}>
              {[
                { id:'name',        label:'Project name',  type:'text',  placeholder:'Enter project name',        required:true },
                { id:'description', label:'Description',   type:'area',  placeholder:'Enter project description' },
              ].map(({ id, label, type, placeholder, required }) => (
                <div key={id} style={{ marginBottom:'1rem' }}>
                  <label style={S.appLabel}>{label}</label>
                  {type === 'area'
                    ? <textarea rows={3} value={formData[id]}
                        onChange={e => setFormData({ ...formData, [id]: e.target.value })}
                        onFocus={() => setFocused(id)} onBlur={() => setFocused('')}
                        style={S.appTextarea(focused === id)} placeholder={placeholder} />
                    : <input type={type} value={formData[id]}
                        onChange={e => setFormData({ ...formData, [id]: e.target.value })}
                        onFocus={() => setFocused(id)} onBlur={() => setFocused('')}
                        style={S.appInput(focused === id)} placeholder={placeholder}
                        required={required} />
                  }
                </div>
              ))}

              {/* File upload */}
              <div style={{ marginBottom:'1rem' }}>
                <label style={S.appLabel}>Attachments <span style={{ fontWeight:400, color:S.color.appMuted }}>(optional, max 5)</span></label>
                <input type="file" multiple onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                  style={{ ...S.appInput(false), padding:'7px 12px', cursor:'pointer' }} />
                <p style={{ fontSize:'12px', color:S.color.appMuted, marginTop:'4px' }}>
                  PDF, images, Word — 10 MB each
                </p>
                {selectedFiles.length > 0 && (
                  <Col style={{ gap:'4px', marginTop:'8px' }}>
                    {selectedFiles.map((f, i) => (
                      <Row key={i} style={{ justifyContent:'space-between',
                        padding:'6px 10px', background:'#f8fafc', borderRadius:'6px',
                        border:'1px solid #e2e8f0' }}>
                        <span style={{ fontSize:'13px', color:S.color.appText }}>{f.name}</span>
                        <button type="button"
                          onClick={() => setSelectedFiles(selectedFiles.filter((_,j) => j !== i))}
                          style={{ background:'none', border:'none', cursor:'pointer',
                            fontSize:'13px', color:'#dc2626', padding:'0 4px' }}>
                          Remove
                        </button>
                      </Row>
                    ))}
                  </Col>
                )}
              </div>

              <Row style={{ gap:'8px' }}>
                <button type="submit" style={S.appBtn('primary')}>Create project</button>
                <button type="button"
                  onClick={() => { setShowForm(false); setSelectedFiles([]); }}
                  style={S.appBtn('secondary')}>
                  Cancel
                </button>
              </Row>
            </form>
          </div>
        )}

        {/* ── Projects grid ── */}
        {projects.length === 0 ? (
          <div style={{ ...S.appCard, textAlign:'center', padding:'3rem' }}>
            <p style={{ color:S.color.appMuted, fontSize:'15px' }}>
              No projects yet — create your first one above.
            </p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1rem' }}>
            {projects.map(project => (
              <div key={project._id}
                onClick={() => navigate(`/project/${project._id}`)}
                style={{ ...S.appCard, cursor:'pointer', padding:0, overflow:'hidden',
                  transition:'box-shadow .2s, transform .2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform='none'; }}
              >
                {/* colour strip */}
                <div style={{ height:'4px', background: project.color || S.color.grad }} />
                <div style={{ padding:'1.25rem' }}>
                  <Row style={{ justifyContent:'space-between', marginBottom:'6px' }}>
                    <h3 style={{ fontSize:'15px', fontWeight:600, color:S.color.appText, margin:0 }}>
                      {project.name}
                    </h3>
                    <span style={S.badge(project.status)}>{project.status}</span>
                  </Row>
                  <p style={{ ...S.appBody, fontSize:'13px', marginBottom:'12px',
                    display:'-webkit-box', WebkitLineClamp:2,
                    WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {project.description}
                  </p>
                  <Row style={{ justifyContent:'space-between', alignItems:'center' }}>
                    {project.attachments?.length > 0 && (
                      <span style={{ fontSize:'12px', color:S.color.appMuted }}>
                        📎 {project.attachments.length} file{project.attachments.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {isProjectOwner(project, user) && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(project._id); }}
                        style={{ background:'none', border:'none', cursor:'pointer',
                          fontSize:'13px', color:'#dc2626', fontWeight:500, padding:0,
                          marginLeft:'auto' }}>
                        Delete
                      </button>
                    )}
                  </Row>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};