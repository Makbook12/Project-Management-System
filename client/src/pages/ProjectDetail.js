import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI, tasksAPI } from '../services/api';
import { isProjectOwner, canAccessProject, sameId } from '../utils/auth';
import * as S from '../styles/shared';

const Row = ({ children, style }) => (
  <div style={{ display:'flex', alignItems:'center', ...style }}>{children}</div>
);

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject]         = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [focused, setFocused]         = useState('');
  const [formData, setFormData]       = useState({ title:'', description:'', priority:'medium', dueDate:'' });

  useEffect(() => { fetchData(); }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pr, tr] = await Promise.all([
        projectsAPI.getById(projectId),
        tasksAPI.getByProject(projectId),
      ]);
      setProject(pr.data);
      setTasks(tr.data);
      setError('');
    } catch { setError('Failed to load project'); }
    finally { setLoading(false); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.create({ ...formData, projectId });
      setFormData({ title:'', description:'', priority:'medium', dueDate:'' });
      setShowForm(false);
      setError('');
      fetchData();
    } catch { setError('Failed to create task'); }
  };

  const handleUpdateTask = async (id, updates) => {
    try { await tasksAPI.update(id, updates); fetchData(); }
    catch { setError('Failed to update task'); }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await tasksAPI.delete(id); setError(''); fetchData(); }
    catch { setError('Failed to delete task'); }
  };

  const handleDownloadAttachment = async (filename, originalName) => {
    try {
      const res = await projectsAPI.downloadAttachment(projectId, filename);
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName || filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch { setError('Failed to download attachment'); }
  };

  if (loading) return (
    <div style={{ ...S.appPage, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:S.color.appMuted }}>Loading…</p>
    </div>
  );
  if (!project) return (
    <div style={{ ...S.appPage, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:S.color.appMuted }}>Project not found</p>
    </div>
  );

  const isOwner = isProjectOwner(project, user);
  const canManageTasks = canAccessProject(project, user);
  const statusCols = ['todo', 'in-progress', 'completed'];

  return (
    <div style={S.appPage}>
      {/* ── Header ── */}
      <header style={S.appHeader}>
        <div style={{ ...S.appHeaderInner, gap:'12px' }}>
          <div>
            <button onClick={() => navigate('/dashboard')}
              style={{ background:'none', border:'none', cursor:'pointer',
                fontSize:'13px', color:'#6366f1', fontWeight:500, padding:0,
                marginBottom:'4px', display:'block' }}>
              ← Dashboard
            </button>
            <Row style={{ gap:'10px' }}>
              <h1 style={{ fontSize:'18px', fontWeight:700, color:S.color.appText, margin:0 }}>
                {project.name}
              </h1>
              <span style={S.badge(project.status)}>{project.status}</span>
            </Row>
          </div>
          {canManageTasks && (
            <button onClick={() => setShowForm(!showForm)} style={S.appBtn('primary')}>
              {showForm ? 'Cancel' : '+ New task'}
            </button>
          )}
        </div>
      </header>

      <main style={S.appMain}>
        {error && <div style={{ ...S.alertBox('error'), background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626', marginBottom:'1.5rem' }}>{error}</div>}

        {/* ── Project info card ── */}
        <div style={{ ...S.appCard, marginBottom:'1.5rem',
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
          <div>
            <p style={{ fontSize:'12px', fontWeight:600, color:S.color.appMuted,
              textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' }}>
              Description
            </p>
            <p style={S.appBody}>{project.description || 'No description'}</p>
          </div>
          <div>
            <p style={{ fontSize:'12px', fontWeight:600, color:S.color.appMuted,
              textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px' }}>
              Team
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {project.members?.map(m => (
                <Row key={m._id} style={{ gap:'8px' }}>
                  <div style={{ ...S.avatar(28) }}>{m.name[0].toUpperCase()}</div>
                  <span style={{ fontSize:'14px', color:S.color.appText }}>{m.name}</span>
                  {sameId(m._id, project.owner._id) &&
                    <span style={{ fontSize:'11px', color:S.color.appMuted }}>(owner)</span>}
                </Row>
              ))}
            </div>
          </div>
        </div>

        {/* ── Attachments ── */}
        {project.attachments?.length > 0 && (
          <div style={{ ...S.appCard, marginBottom:'1.5rem' }}>
            <p style={{ fontSize:'12px', fontWeight:600, color:S.color.appMuted,
              textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'10px' }}>
              Attachments
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {project.attachments.map((file) => (
                <Row key={file.filename} style={{ justifyContent:'space-between',
                  padding:'8px 12px', background:'#f8fafc', borderRadius:'8px',
                  border:`1px solid ${S.color.appBorder}` }}>
                  <span style={{ fontSize:'14px', color:S.color.appText }}>
                    {file.originalName}
                  </span>
                  <button type="button"
                    onClick={() => handleDownloadAttachment(file.filename, file.originalName)}
                    style={{ ...S.appBtn('ghost'), padding:'5px 12px', fontSize:'12px' }}>
                    Download
                  </button>
                </Row>
              ))}
            </div>
          </div>
        )}

        {/* ── New task form ── */}
        {showForm && canManageTasks && (
          <div style={{ ...S.appCard, marginBottom:'1.5rem' }}>
            <h3 style={{ ...S.appSubtitle, marginBottom:'1.25rem' }}>Create new task</h3>
            <form onSubmit={handleCreateTask}>
              {[
                { id:'title',       label:'Task title',  type:'text', placeholder:'Enter task title', required:true },
                { id:'description', label:'Description', type:'area', placeholder:'Enter task description' },
              ].map(({ id, label, type, placeholder, required }) => (
                <div key={id} style={{ marginBottom:'1rem' }}>
                  <label style={S.appLabel}>{label}</label>
                  {type === 'area'
                    ? <textarea rows={3} value={formData[id]}
                        onChange={e => setFormData({ ...formData, [id]: e.target.value })}
                        onFocus={() => setFocused(id)} onBlur={() => setFocused('')}
                        style={S.appTextarea(focused === id)} placeholder={placeholder} />
                    : <input type="text" value={formData[id]}
                        onChange={e => setFormData({ ...formData, [id]: e.target.value })}
                        onFocus={() => setFocused(id)} onBlur={() => setFocused('')}
                        style={S.appInput(focused === id)} placeholder={placeholder}
                        required={required} />
                  }
                </div>
              ))}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                <div>
                  <label style={S.appLabel}>Priority</label>
                  <select value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    onFocus={() => setFocused('priority')} onBlur={() => setFocused('')}
                    style={S.appSelect(focused === 'priority')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label style={S.appLabel}>Due date</label>
                  <input type="date" value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    onFocus={() => setFocused('dueDate')} onBlur={() => setFocused('')}
                    style={S.appInput(focused === 'dueDate')} />
                </div>
              </div>

              <Row style={{ gap:'8px' }}>
                <button type="submit" style={S.appBtn('primary')}>Create task</button>
                <button type="button" onClick={() => setShowForm(false)} style={S.appBtn('secondary')}>Cancel</button>
              </Row>
            </form>
          </div>
        )}

        {/* ── Tasks board ── */}
        {tasks.length === 0 ? (
          <div style={{ ...S.appCard, textAlign:'center', padding:'3rem' }}>
            <p style={{ color:S.color.appMuted }}>No tasks yet.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1rem' }}>
            {statusCols.map(col => {
              const colTasks = tasks.filter(t => t.status === col);
              const colLabel = col === 'in-progress' ? 'In progress' : col.charAt(0).toUpperCase() + col.slice(1);
              return (
                <div key={col}>
                  <Row style={{ justifyContent:'space-between', marginBottom:'10px' }}>
                    <span style={{ fontSize:'13px', fontWeight:600, color:S.color.appMuted,
                      textTransform:'uppercase', letterSpacing:'0.05em' }}>
                      {colLabel}
                    </span>
                    <span style={{ fontSize:'12px', background:'#f1f5f9', color:S.color.appMuted,
                      borderRadius:'12px', padding:'2px 8px', fontWeight:500 }}>
                      {colTasks.length}
                    </span>
                  </Row>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {colTasks.length === 0 && (
                      <div style={{ padding:'1.5rem', textAlign:'center',
                        border:'1.5px dashed #e2e8f0', borderRadius:'10px',
                        color:S.color.appMuted, fontSize:'13px' }}>
                        Empty
                      </div>
                    )}
                    {colTasks.map(task => (
                      <div key={task._id}
                        onClick={() => navigate(`/project/${projectId}/task/${task._id}`)}
                        style={{ ...S.appCard, padding:'1rem', cursor:'pointer',
                          transition:'box-shadow .15s, transform .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform='none'; }}>
                        <p style={{ fontSize:'14px', fontWeight:600, color:S.color.appText,
                          margin:'0 0 6px' }}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p style={{ fontSize:'12px', color:S.color.appMuted, margin:'0 0 10px',
                            display:'-webkit-box', WebkitLineClamp:2,
                            WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                            {task.description}
                          </p>
                        )}
                        <Row style={{ justifyContent:'space-between', gap:'6px' }}
                          onClick={e => e.stopPropagation()}>
                          <Row style={{ gap:'6px' }}>
                            <span style={S.badge(task.priority)}>{task.priority}</span>
                            {task.dueDate && (
                              <span style={{ fontSize:'11px', color:S.color.appMuted }}>
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </Row>
                          <Row style={{ gap:'6px' }}>
                            <select
                              value={task.status}
                              onClick={e => e.stopPropagation()}
                              onChange={e => {
                                e.stopPropagation();
                                handleUpdateTask(task._id, { status: e.target.value });
                              }}
                              style={{ fontSize:'11px', padding:'3px 6px', border:`1px solid ${S.color.appBorder}`,
                                borderRadius:'6px', background:'#fff', color:S.color.appText,
                                cursor:'pointer', outline:'none' }}>
                              <option value="todo">To do</option>
                              <option value="in-progress">In progress</option>
                              <option value="completed">Completed</option>
                            </select>
                            {isOwner && (
                              <button
                                onClick={e => { e.stopPropagation(); handleDeleteTask(task._id); }}
                                style={{ background:'none', border:'none', cursor:'pointer',
                                  fontSize:'12px', color:'#dc2626', padding:0, fontWeight:500 }}>
                                ✕
                              </button>
                            )}
                          </Row>
                        </Row>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};