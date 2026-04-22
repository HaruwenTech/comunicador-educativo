import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AnnouncementType } from '../types';
import { Loader2, PlusCircle, LogOut, ShieldCheck, Settings, Type, FileText, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import { motion } from 'framer-motion';

const Admin = () => {
  const { user, profile, signOut } = useAuth();
  const { notify } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<AnnouncementType>('info');
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['1ro']);
  const [selectedSections, setSelectedSections] = useState<string[]>(['A']);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  const navigate = useNavigate();

  const grades = ['all', '1ro', '2do', '3ro', '4to', '5to', '6to'];
  const sections = ['all', 'A', 'B', 'C'];

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
    
    if (!error && data) setAnnouncements(data);
    setLoadingAnnouncements(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este comunicado?')) return;
    
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) {
      notify('Comunicado eliminado', 'success');
      fetchAnnouncements();
    } else {
      notify('Error al eliminar: ' + error.message, 'error');
    }
  };

  useEffect(() => {
    if (profile) fetchAnnouncements();
  }, [profile]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    setSubmitting(true);
    const { error } = await supabase.from('announcements').insert([
      { 
        title, 
        content, 
        type, 
        grade: selectedGrades.join(', '), 
        section: selectedSections.join(', '), 
        author_id: profile?.id 
      }
    ]);

    if (!error) {
      notify('El comunicado ha sido publicado con éxito', 'success', '¡Publicado!');
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } else {
      notify('No se pudo publicar: ' + error.message, 'error');
    }
    setSubmitting(false);
  };

  if (profile?.role === 'parent') {
    return (
      <main className="container" style={{ textAlign: 'center', marginTop: '6rem' }}>
        <div style={{ background: '#fff1f2', color: '#be123c', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <ShieldCheck size={40} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Acceso Denegado</h2>
        <p style={{ color: 'var(--secondary)', maxWidth: '400px', margin: '0 auto' }}>Lo sentimos, esta sección es exclusiva para personal administrativo autorizado.</p>
        <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>
          Regresar al Inicio
        </button>
      </main>
    );
  }

  return (
    <main className="container" style={{ marginTop: '2rem', paddingBottom: '5rem', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate('/')} 
            className="btn-secondary"
            style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Settings size={14} />
              Administración
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Publicar Aviso</h2>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }} className="hide-mobile">
            <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{profile?.full_name || profile?.email || user?.email}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', margin: 0 }}>
              {profile?.role === 'super_admin' ? 'Super Administrador' : 'Administrador'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
        {/* Lado Izquierdo: Crear Nuevo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card" 
          style={{ padding: '2rem', position: 'sticky', top: '2rem' }}
        >
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <PlusCircle size={20} color="var(--primary)" />
            Nuevo Comunicado
          </h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', display: 'block', marginBottom: '0.5rem' }}>Categoría</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                  {(['info', 'strike', 'early_dismissal', 'urgent'] as AnnouncementType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      style={{
                        padding: '0.6rem',
                        fontSize: '0.75rem',
                        borderRadius: '10px',
                        background: type === t ? 'var(--primary)' : '#f8fafc',
                        color: type === t ? 'white' : 'var(--secondary)',
                        border: '1px solid',
                        borderColor: type === t ? 'var(--primary)' : 'var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontWeight: 600
                      }}
                    >
                      <span>{t === 'info' ? 'ℹ️' : t === 'strike' ? '📢' : t === 'early_dismissal' ? '🕒' : '🚨'}</span>
                      {t === 'info' ? 'General' : t === 'strike' ? 'Paro' : t === 'early_dismissal' ? 'Salida' : 'Urgente'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', display: 'block', marginBottom: '0.5rem' }}>Destinatarios (Grados)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {['1ro', '2do', '3ro', '4to', '5to', '6to', 'Todas'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        if (g === 'Todas') setSelectedGrades(['Todas']);
                        else setSelectedGrades(prev => prev.filter(i => i !== 'Todas').includes(g) ? prev.filter(i => i !== g) : [...prev.filter(i => i !== 'Todas'), g]);
                      }}
                      style={{
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.75rem',
                        borderRadius: '8px',
                        background: selectedGrades.includes(g) ? 'var(--primary)' : '#f8fafc',
                        color: selectedGrades.includes(g) ? 'white' : 'var(--secondary)',
                        border: '1px solid var(--border)',
                        fontWeight: 600
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', display: 'block', marginBottom: '0.5rem' }}>Asunto</label>
                <input 
                  className="input-field" 
                  placeholder="Título breve..." 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required
                  style={{ padding: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', display: 'block', marginBottom: '0.5rem' }}>Mensaje Completo</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '120px', resize: 'none', padding: '0.8rem' }}
                  placeholder="Detalles del aviso..." 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  required
                />
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', borderRadius: '14px' }} 
                disabled={submitting}
              >
                {submitting ? <Loader2 className="animate-spin" /> : 'Publicar Comunicado'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Lado Derecho: Gestión */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FileText size={20} color="var(--primary)" />
              Historial y Gestión
            </h3>
            <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontWeight: 700 }}>
              {announcements.length} Comunicados
            </span>
          </div>

          {loadingAnnouncements ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Loader2 className="animate-spin" size={30} color="var(--primary)" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map((a) => (
                <div key={a.id} className="card" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--secondary)' }}>
                        {new Date(a.created_at).toLocaleDateString()}
                      </span>
                      <span style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                        {a.grade} - {a.section}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem' }}>{a.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                      {a.content}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(a.id)}
                    style={{ color: '#ef4444', padding: '0.5rem', borderRadius: '8px', background: '#fee2e2' }}
                    title="Eliminar"
                  >
                    <ShieldCheck size={18} />
                  </button>
                </div>
              ))}
              {announcements.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)', background: '#f8fafc', borderRadius: '20px', border: '2px dashed var(--border)' }}>
                  No hay comunicados para gestionar.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default Admin;
