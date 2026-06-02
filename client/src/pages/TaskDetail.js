import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tasksAPI, projectsAPI } from '../services/api';
import { isProjectOwner, canAccessProject } from '../utils/auth';
import * as S from '../styles/shared';

const Row = ({ children, style }) => (
  <div style={{ display:'flex', alignItems:'center', ...style }}>{children}</div>
);

const MetaCard = ({ label, value }) => (
  <div style={{ background:'#f8fafc', border:`1px solid ${S.color.appBorder}`,
    borderRadius:'10px', padding:'0.875rem 1rem' }}>
    <p style={{ fontSize:'11px', fontWeight:600, color:S.color.appMuted,
      textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 4px' }}>
      {label}
    </p>
    <p style={{ fontSize:'15px', fontWeight:600, color:S.color.appText, margin:0 }}>{value}</p>
  </div>
);

export const TaskDetail = () => {
  const { projectId, taskId } = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [task, setTask]         = useState(null);
  const [project, setProject]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [focused, setFocused]   = useState('');

  useEffect(() => { fetchData(); }, [projectId, taskId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tr, pr] = await Promise.all([
        tasksAPI.getById(taskId),
        projectsAPI.getById(projectId),
      ]);
      setTask(tr.data);
      setProject(pr.data);
      setFormData({
        title:      tr.data.title,
        description:tr.data.description,
        status:     tr.data.status,
        priority:   tr.data.priority,
        dueDate:    tr.data.dueDate ? tr.data.dueDate.split('T')[0] : '',
        assignedTo: tr.data.assignedTo?._id || '',
      });
    } catch { setError('Failed to load task'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    try { await tasksAPI.update(taskId, formData); setEditMode(false); fetchData(); }
    catch { setError('Failed to update task'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try { await tasksAPI.delete(taskId); navigate(`/project/${projectId}`); }
    catch { setError('Failed to delete task'); }
  };

  if (loading) return (
    <div style={{ ...S.appPage, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:S.color.appMuted }}>Loading…</p>
    </div>
  );
  if (!task) return (
    <div style={{ ...S.appPage, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:S.color.appMuted }}>Task not found</p>
    </div>
  );

  const canEdit = canAccessProject(project, user);
  const canDelete = isProjectOwner(project, user);

  // ── shared field renderer ──────────────────────────────────────────────────
  const Field = ({ id, label, type='text', children }) => (
    <div style={{ marginBottom:'1rem' }}>
      <label style={S.appLabel}>{label}</label>
      {children ?? (
        type === 'area'
          ? <textarea rows={5} value={formData[id]}
              onChange={e => setFormData({ ...formData, [id]: e.target.value })}
              onFocus={() => setFocused(id)} onBlur={() => setFocused('')}
              style={S.appTextarea(focused === id)} />
          : <input type={type} value={formData[id]}
              onChange={e => setFormData({ ...formData, [id]: e.target.value })}
              onFocus={() => setFocused(id)} onBlur={() => setFocused('')}
              style={S.appInput(focused === id)} />
      )}
    </div>
  );

  return (
    <div style={S.appPage}>
      {/* ── Header ── */}
      <header style={S.appHeader}>
        <div style={{ ...S.appHeaderInner }}>
          <button onClick={() => navigate(`/project/${projectId}`)}
            style={{ background:'none', border:'none', cursor:'pointer',
              fontSize:'13px', color:'#6366f1', fontWeight:500, padding:0 }}>
            ← Back to project
          </button>

          {canEdit && (
            <Row style={{ gap:'8px' }}>
              {editMode ? (
                <>
                  <button onClick={handleUpdate}
                    style={{ ...S.appBtn('primary'), padding:'7px 16px', fontSize:'13px' }}>
                    Save changes
                  </button>
                  <button onClick={() => setEditMode(false)}
                    style={{ ...S.appBtn('secondary'), padding:'7px 14px', fontSize:'13px' }}>
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)}
                  style={{ ...S.appBtn('ghost'), padding:'7px 16px', fontSize:'13px' }}>
                  Edit
                </button>
              )}
              {canDelete && (
                <button onClick={handleDelete}
                  style={{ ...S.appBtn('danger'), padding:'7px 14px', fontSize:'13px' }}>
                  Delete
                </button>
              )}
            </Row>
          )}
        </div>
      </header>

      <main style={{ ...S.appMain, maxWidth:'760px' }}>
        {error && <div style={{ ...S.alertBox('error'), background:'#fee2e2',
          border:'1px solid #fca5a5', color:'#dc2626', marginBottom:'1.5rem' }}>{error}</div>}

        <div style={S.appCard}>
          {editMode ? (
            <form onSubmit={e => { e.preventDefault(); handleUpdate(); }}>
              <Field id="title" label="Title" />
              <Field id="description" label="Description" type="area" />

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1rem', marginBottom:'1rem' }}>
                {/* Status */}
                <div>
                  <label style={S.appLabel}>Status</label>
                  <select value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    onFocus={() => setFocused('status')} onBlur={() => setFocused('')}
                    style={S.appSelect(focused === 'status')}>
                    <option value="todo">To do</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                {/* Priority */}
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
                {/* Due date */}
                <div>
                  <label style={S.appLabel}>Due date</label>
                  <input type="date" value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    onFocus={() => setFocused('due')} onBlur={() => setFocused('')}
                    style={S.appInput(focused === 'due')} />
                </div>
              </div>

              {project?.members?.length > 0 && (
                <div style={{ marginBottom:'1rem' }}>
                  <label style={S.appLabel}>Assign to</label>
                  <select value={formData.assignedTo}
                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                    onFocus={() => setFocused('assign')} onBlur={() => setFocused('')}
                    style={S.appSelect(focused === 'assign')}>
                    <option value="">Unassigned</option>
                    {project.members.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </form>
          ) : (
            <>
              {/* ── View mode ── */}
              <div style={{ marginBottom:'1.5rem' }}>
                <h1 style={{ fontSize:'24px', fontWeight:700, color:S.color.appText,
                  margin:'0 0 10px' }}>
                  {task.title}
                </h1>
                <Row style={{ gap:'8px', flexWrap:'wrap' }}>
                  <span style={S.badge(task.status)}>
                    {task.status.replace('-', ' ')}
                  </span>
                  <span style={S.badge(task.priority)}>
                    {task.priority} priority
                  </span>
                </Row>
              </div>

              {/* Meta row */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))',
                gap:'10px', marginBottom:'1.5rem' }}>
                <MetaCard label="Created by"  value={task.createdBy?.name || 'Unknown'} />
                {task.assignedTo && <MetaCard label="Assigned to" value={task.assignedTo.name} />}
                {task.dueDate && <MetaCard label="Due date"
                  value={new Date(task.dueDate).toLocaleDateString()} />}
              </div>

              {task.description && (
                <div style={{ marginBottom:'1.5rem' }}>
                  <p style={{ fontSize:'12px', fontWeight:600, color:S.color.appMuted,
                    textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px' }}>
                    Description
                  </p>
                  <p style={{ ...S.appBody, whiteSpace:'pre-wrap' }}>{task.description}</p>
                </div>
              )}

              {task.tags?.length > 0 && (
                <div>
                  <p style={{ fontSize:'12px', fontWeight:600, color:S.color.appMuted,
                    textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px' }}>
                    Tags
                  </p>
                  <Row style={{ gap:'6px', flexWrap:'wrap' }}>
                    {task.tags.map((tag, i) => (
                      <span key={i} style={{ background:'#ede9fe', color:'#6d28d9',
                        padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:500 }}>
                        {tag}
                      </span>
                    ))}
                  </Row>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};