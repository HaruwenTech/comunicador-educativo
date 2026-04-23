import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AnnouncementType } from '../types';
import { Loader2, PlusCircle, ShieldCheck, FileText, ArrowLeft, Bell, Calendar, AlertTriangle, RefreshCw, Edit2, Trash2, Users, Clock, Shield, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  parent: 'Padre/Madre',
};
const ROLE_COLORS: Record<string, string> = {
  super_admin: '#4f46e5',
  admin: '#0891b2',
  parent: '#64748b',
};

const Admin = () => {
  const { profile } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  // Tabs
  const [activeTab, setActiveTab] = useState<'comunicados' | 'usuarios'>('comunicados');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<AnnouncementType>('info');
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['1ro']);
  const [selectedSections, setSelectedSections] = useState<string[]>(['A']);
  const [scheduledAt, setScheduledAt] = useState(new Date().toISOString().slice(0, 16));
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Data
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (!error && data) setAnnouncements(data);
    setLoadingAnnouncements(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase.from('profiles').select('*').order('role');
    if (!error && data) setUsers(data);
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (profile) {
      fetchAnnouncements();
      fetchUsers();
    }
  }, [profile]);

  const handleEdit = (a: any) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setType(a.type);
    setSelectedGrades(a.grade.split(', '));
    setSelectedSections(a.section.split(', '));
    if (a.scheduled_at) setScheduledAt(new Date(a.scheduled_at).toISOString().slice(0, 16));
    setActiveTab('comunicados');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setType('info');
    setSelectedGrades(['1ro']);
    setSelectedSections(['A']);
    setScheduledAt(new Date().toISOString().slice(0, 16));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    const payload = { title, content, type, grade: selectedGrades.join(', '), section: selectedSections.join(', '), author_id: profile?.id };
    const { error } = editingId
      ? await supabase.from('announcements').update(payload).eq('id', editingId)
      : await supabase.from('announcements').insert([payload]);
    if (!error) { notify(editingId ? 'Cambios guardados' : 'Publicado con éxito', 'success'); resetForm(); fetchAnnouncements(); }
    else notify('Error: ' + error.message, 'error');
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este comunicado?')) return;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) { notify('Eliminado', 'success'); fetchAnnouncements(); }
    else notify('Error al eliminar', 'error');
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === profile?.id) { notify('No podés cambiar tu propio rol', 'error'); return; }
    setUpdatingRole(userId);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) { notify(`Rol actualizado a ${ROLE_LABELS[newRole]}`, 'success'); fetchUsers(); }
    else notify('Error: ' + error.message, 'error');
    setUpdatingRole(null);
  };

  if (profile?.role === 'parent') {
    return (
      <main className="container" style={{ textAlign: 'center', marginTop: '6rem' }}>
        <ShieldCheck size={80} color="#be123c" style={{ marginBottom: '1.5rem' }} />
        <h2>Acceso Denegado</h2>
        <button className="btn-primary" onClick={() => navigate('/')}>Volver</button>
      </main>
    );
  }

  const stats = {
    total: announcements.length,
    urgent: announcements.filter(a => a.type === 'urgent' || a.type === 'strike').length,
    today: announcements.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length,
    usuarios: users.length,
  };

  return (
    <main className="container" style={{ marginTop: '1.5rem', paddingBottom: '5rem', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Panel Administrativo</h2>
          <p style={{ color: 'var(--secondary)', fontWeight: 600, margin: '0.25rem 0 0' }}>Bienvenida, {profile?.full_name?.split(' ')[0] || 'Admin'}. Aquí tenés el control total de W.I.N.</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-secondary" style={{ borderRadius: '12px', whiteSpace: 'nowrap' }}>
          <ArrowLeft size={18} /> Volver
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Comunicados', value: stats.total, icon: <FileText size={18} color="#6366f1" />, bg: '#eef2ff' },
          { label: 'Hoy', value: stats.today, icon: <Bell size={18} color="#10b981" />, bg: '#ecfdf5' },
          { label: 'Urgentes', value: stats.urgent, icon: <AlertTriangle size={18} color="#ef4444" />, bg: '#fef2f2' },
          { label: 'Usuarios', value: stats.usuarios, icon: <Users size={18} color="#f59e0b" />, bg: '#fffbeb' },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ y: -3 }} className="card" style={{ padding: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.7rem', border: 'none' }}>
            <div style={{ padding: '0.5rem', background: s.bg, borderRadius: '10px', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '0.6rem', color: 'var(--secondary)', fontWeight: 700, margin: 0 }}>{s.label}</p>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{s.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '14px' }}>
        {[
          { key: 'comunicados', label: 'Comunicados', icon: <FileText size={16} /> },
          { key: 'usuarios', label: 'Usuarios', icon: <Users size={16} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.85rem',
              background: activeTab === tab.key ? 'white' : 'transparent',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--secondary)',
              boxShadow: activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB: COMUNICADOS */}
        {activeTab === 'comunicados' && (
          <motion.div key="comunicados" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
              {/* Form */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                  {editingId ? <Edit2 size={18} color="var(--primary)" /> : <PlusCircle size={18} color="var(--primary)" />}
                  {editingId ? 'Editar Comunicado' : 'Nuevo Comunicado'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>CATEGORÍA</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                        {(['info', 'strike', 'early_dismissal', 'urgent'] as AnnouncementType[]).map(t => (
                          <button key={t} type="button" onClick={() => setType(t)} style={{ padding: '0.6rem', borderRadius: '10px', background: type === t ? 'var(--primary)' : '#f1f5f9', color: type === t ? 'white' : '#64748b', border: 'none', fontSize: '0.75rem', fontWeight: 700, transition: '0.2s' }}>
                            {t === 'info' ? 'ℹ️ General' : t === 'strike' ? '📢 Paro' : t === 'early_dismissal' ? '🕒 Salida' : '🚨 Urgente'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>DESTINATARIOS</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        {['1ro', '2do', '3ro', '4to', '5to', '6to', 'Todas'].map(g => (
                          <button key={g} type="button" onClick={() => g === 'Todas' ? setSelectedGrades(['Todas']) : setSelectedGrades(prev => prev.includes(g) ? prev.filter(i => i !== g) : [...prev.filter(i => i !== 'Todas'), g])}
                            style={{ padding: '0.35rem 0.7rem', borderRadius: '8px', background: selectedGrades.includes(g) ? '#4f46e5' : '#f1f5f9', color: selectedGrades.includes(g) ? 'white' : '#64748b', border: 'none', fontSize: '0.75rem', fontWeight: 700 }}>
                            {g}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {['A', 'B', 'C', 'Todas'].map(s => (
                          <button key={s} type="button" onClick={() => s === 'Todas' ? setSelectedSections(['Todas']) : setSelectedSections(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev.filter(i => i !== 'Todas'), s])}
                            style={{ padding: '0.35rem 0.7rem', borderRadius: '8px', background: selectedSections.includes(s) ? '#10b981' : '#f1f5f9', color: selectedSections.includes(s) ? 'white' : '#64748b', border: 'none', fontSize: '0.75rem', fontWeight: 700 }}>
                            Sección {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <input className="input-field" placeholder="Título del aviso..." value={title} onChange={e => setTitle(e.target.value)} required />

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.6rem', display: 'block' }}>PROGRAMAR PUBLICACIÓN</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem', marginBottom: '0.6rem' }}>
                        <div style={{ position: 'relative' }}>
                          <Calendar size={16} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }} />
                          <input type="date" className="calendar-input" value={scheduledAt.split('T')[0]} onChange={e => setScheduledAt(`${e.target.value}T${scheduledAt.split('T')[1] || '08:00'}`)} required />
                        </div>
                        <div style={{ position: 'relative' }}>
                          <Clock size={16} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }} />
                          <input type="text" placeholder="HH:MM" className="calendar-input" value={scheduledAt.split('T')[1]} onChange={e => setScheduledAt(`${scheduledAt.split('T')[0]}T${e.target.value}`)} required />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {['08:00', '13:00', '17:00', '20:00'].map(t => (
                          <button key={t} type="button" onClick={() => setScheduledAt(`${scheduledAt.split('T')[0]}T${t}`)}
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.7rem', borderRadius: '8px', background: (scheduledAt.split('T')[1] || '').startsWith(t) ? 'var(--primary)' : '#f1f5f9', color: (scheduledAt.split('T')[1] || '').startsWith(t) ? 'white' : '#64748b', border: 'none', fontWeight: 700, transition: '0.2s' }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea className="input-field" style={{ minHeight: '100px', resize: 'none' }} placeholder="Mensaje..." value={content} onChange={e => setContent(e.target.value)} required />

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {editingId && <button type="button" onClick={resetForm} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>}
                      <button className="btn-primary" style={{ flex: 2, padding: '0.9rem' }} disabled={submitting}>
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Guardar Cambios' : 'Publicar Ahora')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 800, color: '#1e293b', margin: 0 }}>Gestión de Contenido</h3>
                  <button onClick={fetchAnnouncements} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '10px' }}><RefreshCw size={15} /></button>
                </div>
                {loadingAnnouncements ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>
                ) : announcements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', border: '2px dashed var(--border)' }}>
                    <p style={{ color: 'var(--secondary)' }}>No hay comunicados aún</p>
                  </div>
                ) : (
                  announcements.map(a => (
                    <motion.div key={a.id} layout className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', border: '1px solid #f1f5f9' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(79,70,229,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{a.grade} · {a.section}</span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.1rem 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.content}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                        <button onClick={() => handleEdit(a)} style={{ padding: '0.5rem', borderRadius: '8px', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer' }}><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(a.id)} style={{ padding: '0.5rem', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={15} /></button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: USUARIOS */}
        {activeTab === 'usuarios' && (
          <motion.div key="usuarios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 800, color: '#1e293b', margin: 0 }}>Gestión de Usuarios ({users.length})</h3>
              <button onClick={fetchUsers} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '10px' }}><RefreshCw size={15} /></button>
            </div>

            {loadingUsers ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={36} color="var(--primary)" /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {users.map(u => {
                  const initials = (u.full_name || u.email || '?').split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
                  const isMe = u.id === profile?.id;
                  const roleColor = ROLE_COLORS[u.role] || '#64748b';
                  return (
                    <motion.div key={u.id} layout className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: isMe ? `2px solid ${roleColor}` : '1px solid #f1f5f9' }}>
                      {/* Avatar */}
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${roleColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, color: roleColor, fontSize: '1rem' }}>
                        {initials}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{u.full_name || 'Sin nombre'}</span>
                          {isMe && <span style={{ fontSize: '0.6rem', fontWeight: 800, background: '#eef2ff', color: 'var(--primary)', padding: '0.15rem 0.4rem', borderRadius: '6px' }}>TÚ</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                        {(u.grade || u.section) && (
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{u.grade} {u.section && `· Sección ${u.section}`}</p>
                        )}
                      </div>
                      {/* Role + Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: roleColor, background: `${roleColor}15`, padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                        {!isMe && profile?.role === 'super_admin' && (
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleRoleChange(u.id, 'admin')}
                                disabled={updatingRole === u.id}
                                title="Promover a Admin"
                                style={{ padding: '0.4rem', borderRadius: '8px', background: '#e0f2fe', color: '#0891b2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                {updatingRole === u.id ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
                              </button>
                            )}
                            {u.role !== 'parent' && (
                              <button
                                onClick={() => handleRoleChange(u.id, 'parent')}
                                disabled={updatingRole === u.id}
                                title="Quitar permisos admin"
                                style={{ padding: '0.4rem', borderRadius: '8px', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                {updatingRole === u.id ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Admin;
