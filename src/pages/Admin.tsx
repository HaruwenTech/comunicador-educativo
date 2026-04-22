import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AnnouncementType } from '../types';
import { Loader2, PlusCircle, ShieldCheck, FileText, ArrowLeft, Bell, Calendar, AlertTriangle, RefreshCw, Edit2, Trash2, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import { motion } from 'framer-motion';

const Admin = () => {
  const { profile } = useAuth();
  const { notify } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<AnnouncementType>('info');
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['1ro']);
  const [selectedSections, setSelectedSections] = useState<string[]>(['A']);
  const [scheduledAt, setScheduledAt] = useState(new Date().toISOString().slice(0, 16));
  
  // App State
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setAnnouncements(data);
    setLoadingAnnouncements(false);
  };

  useEffect(() => {
    if (profile) fetchAnnouncements();
  }, [profile]);

  const handleEdit = (a: any) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setType(a.type);
    setSelectedGrades(a.grade.split(', '));
    setSelectedSections(a.section.split(', '));
    if (a.scheduled_at) setScheduledAt(new Date(a.scheduled_at).toISOString().slice(0, 16));
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
    const payload = { 
      title, 
      content, 
      type, 
      grade: selectedGrades.join(', '), 
      section: selectedSections.join(', '), 
      author_id: profile?.id 
    };

    const { error } = editingId 
      ? await supabase.from('announcements').update(payload).eq('id', editingId)
      : await supabase.from('announcements').insert([payload]);

    if (!error) {
      notify(editingId ? 'Cambios guardados' : 'Publicado con éxito', 'success');
      resetForm();
      fetchAnnouncements();
    } else {
      notify('Error: ' + error.message, 'error');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este comunicado?')) return;
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      notify('Comunicado eliminado', 'success');
      fetchAnnouncements();
    } catch (error: any) {
      notify('Error: ' + error.message, 'error');
    }
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
  };

  return (
    <main className="container" style={{ marginTop: '2rem', paddingBottom: '5rem', maxWidth: '1200px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e293b' }}>Panel Administrativo</h2>
          <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Bienvenida, {profile?.full_name || 'Admin'}. Aquí tienes el control total de W.I.N.</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-secondary" style={{ borderRadius: '12px' }}>
          <ArrowLeft size={18} /> Volver al Inicio
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Comunicados', value: stats.total, icon: <FileText color="#6366f1" />, bg: '#eef2ff' },
          { label: 'Alertas Hoy', value: stats.today, icon: <Bell color="#10b981" />, bg: '#ecfdf5' },
          { label: 'Urgentes/Paros', value: stats.urgent, icon: <AlertTriangle color="#ef4444" />, bg: '#fef2f2' },
          { label: 'Personal Admin', value: '4 Activos', icon: <Users color="#f59e0b" />, bg: '#fffbeb' },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem', border: 'none', background: 'white' }}>
            <div style={{ padding: '1rem', background: s.bg, borderRadius: '16px' }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700, margin: 0 }}>{s.label}</p>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{s.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Form */}
        <motion.div className="card" style={{ padding: '2rem', background: 'white' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800 }}>
            {editingId ? <Edit2 size={20} color="var(--primary)" /> : <PlusCircle size={20} color="var(--primary)" />}
            {editingId ? 'Editar Comunicado' : 'Nuevo Comunicado'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>CATEGORÍA</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                  {(['info', 'strike', 'early_dismissal', 'urgent'] as AnnouncementType[]).map(t => (
                    <button key={t} type="button" onClick={() => setType(t)} style={{ padding: '0.6rem', borderRadius: '12px', background: type === t ? 'var(--primary)' : '#f1f5f9', color: type === t ? 'white' : '#64748b', border: 'none', fontSize: '0.75rem', fontWeight: 700, transition: '0.2s' }}>
                      {t === 'info' ? 'ℹ️ General' : t === 'strike' ? '📢 Paro' : t === 'early_dismissal' ? '🕒 Salida' : '🚨 Urgente'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>DESTINATARIOS</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.8rem' }}>
                  {['1ro', '2do', '3ro', '4to', '5to', '6to', 'Todas'].map(g => (
                    <button key={g} type="button" onClick={() => g === 'Todas' ? setSelectedGrades(['Todas']) : setSelectedGrades(prev => prev.includes(g) ? prev.filter(i => i !== g) : [...prev.filter(i => i !== 'Todas'), g])}
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: selectedGrades.includes(g) ? '#4f46e5' : '#f1f5f9', color: selectedGrades.includes(g) ? 'white' : '#64748b', border: 'none', fontSize: '0.75rem', fontWeight: 700 }}>
                      {g}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {['A', 'B', 'C', 'Todas'].map(s => (
                    <button key={s} type="button" onClick={() => s === 'Todas' ? setSelectedSections(['Todas']) : setSelectedSections(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev.filter(i => i !== 'Todas'), s])}
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: selectedSections.includes(s) ? '#10b981' : '#f1f5f9', color: selectedSections.includes(s) ? 'white' : '#64748b', border: 'none', fontSize: '0.75rem', fontWeight: 700 }}>
                      Sección {s}
                    </button>
                  ))}
                </div>
              </div>

              <input className="input-field" placeholder="Título del aviso..." value={title} onChange={e => setTitle(e.target.value)} required />
              
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', marginBottom: '0.8rem', display: 'block' }}>PROGRAMAR PUBLICACIÓN</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }} />
                    <input 
                      type="date" 
                      className="calendar-input" 
                      value={scheduledAt.split('T')[0]} 
                      onChange={e => setScheduledAt(`${e.target.value}T${scheduledAt.split('T')[1] || '08:00'}`)} 
                      required 
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Clock size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }} />
                    <input 
                      type="text" 
                      placeholder="HH:MM"
                      className="calendar-input" 
                      value={scheduledAt.split('T')[1]} 
                      onChange={e => setScheduledAt(`${scheduledAt.split('T')[0]}T${e.target.value}`)} 
                      required 
                    />
                  </div>
                </div>
                
                {/* Quick Time Selectors */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['08:00', '13:00', '17:00', '20:00'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setScheduledAt(`${scheduledAt.split('T')[0]}T${t}`)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.7rem',
                        borderRadius: '8px',
                        background: (scheduledAt.split('T')[1] || '').startsWith(t) ? 'var(--primary)' : '#f1f5f9',
                        color: (scheduledAt.split('T')[1] || '').startsWith(t) ? 'white' : '#64748b',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <textarea className="input-field" style={{ minHeight: '120px', resize: 'none' }} placeholder="Escribe el mensaje aquí..." value={content} onChange={e => setContent(e.target.value)} required />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {editingId && <button type="button" onClick={resetForm} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>}
                <button className="btn-primary" style={{ flex: 2, padding: '1rem' }} disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" /> : (editingId ? 'Guardar Cambios' : 'Publicar Ahora')}
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Right: Management List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 800, color: '#1e293b' }}>Gestión de Contenido</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={fetchAnnouncements} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '10px' }}><RefreshCw size={16} /></button>
            </div>
          </div>

          {loadingAnnouncements ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map(a => (
                <motion.div key={a.id} layout className="card" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary)', background: 'rgba(79, 70, 229, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{a.grade} {a.section}</span>
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#334155' }}>{a.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.content}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginLeft: '1rem' }}>
                    <button onClick={() => handleEdit(a)} style={{ padding: '0.6rem', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(a.id)} style={{ padding: '0.6rem', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Admin;
