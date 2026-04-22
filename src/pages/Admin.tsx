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

  const navigate = useNavigate();

  const grades = ['all', '1ro', '2do', '3ro', '4to', '5to', '6to'];
  const sections = ['all', 'A', 'B', 'C'];

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
      navigate('/');
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

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card" 
        style={{ padding: '2.5rem' }}
      >
        <form onSubmit={handleCreate}>
          <div className="admin-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '2.5rem' 
          }}>
            {/* Columna Izquierda: Configuración */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
                  <Type size={18} />
                  <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>Categoría</label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {(['info', 'strike', 'early_dismissal', 'urgent'] as AnnouncementType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      style={{
                        padding: '0.75rem',
                        fontSize: '0.8rem',
                        borderRadius: '12px',
                        background: type === t ? 'var(--primary)' : '#f8fafc',
                        color: type === t ? 'white' : 'var(--secondary)',
                        border: '2px solid',
                        borderColor: type === t ? 'var(--primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>{t === 'info' ? 'ℹ️' : t === 'strike' ? '📢' : t === 'early_dismissal' ? '🕒' : '🚨'}</span>
                      <span style={{ fontWeight: 700 }}>{t === 'info' ? 'General' : t === 'strike' ? 'Paro' : t === 'early_dismissal' ? 'Salida' : 'Urgente'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                    <Users size={16} />
                    <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>Grados</label>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['1ro', '2do', '3ro', '4to', '5to', '6to', 'Todas'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          if (g === 'Todas') {
                            setSelectedGrades(['Todas']);
                          } else {
                            setSelectedGrades(prev => {
                              const filtered = prev.filter(item => item !== 'Todas');
                              if (filtered.includes(g)) {
                                return filtered.filter(item => item !== g);
                              }
                              return [...filtered, g];
                            });
                          }
                        }}
                        style={{
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.8rem',
                          borderRadius: '10px',
                          background: selectedGrades.includes(g) ? 'var(--primary)' : '#f8fafc',
                          color: selectedGrades.includes(g) ? 'white' : 'var(--secondary)',
                          border: '1px solid',
                          borderColor: selectedGrades.includes(g) ? 'var(--primary)' : 'var(--border)',
                          fontWeight: 600
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                    <Settings size={16} />
                    <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>Secciones</label>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['A', 'B', 'C', 'Todas'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          if (s === 'Todas') {
                            setSelectedSections(['Todas']);
                          } else {
                            setSelectedSections(prev => {
                              const filtered = prev.filter(item => item !== 'Todas');
                              if (filtered.includes(s)) {
                                return filtered.filter(item => item !== s);
                              }
                              return [...filtered, s];
                            });
                          }
                        }}
                        style={{
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.8rem',
                          borderRadius: '10px',
                          background: selectedSections.includes(s) ? 'var(--primary)' : '#f8fafc',
                          color: selectedSections.includes(s) ? 'white' : 'var(--secondary)',
                          border: '1px solid',
                          borderColor: selectedSections.includes(s) ? 'var(--primary)' : 'var(--border)',
                          fontWeight: 600
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                  <Type size={16} />
                  <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>Asunto</label>
                </div>
                <input 
                  className="input-field" 
                  placeholder="Título del aviso..." 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required
                />
              </div>
            </div>

            {/* Columna Derecha: Mensaje y Publicar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                  <FileText size={16} />
                  <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>Mensaje</label>
                </div>
                <textarea 
                  className="input-field" 
                  style={{ flex: 1, minHeight: '200px', resize: 'none' }}
                  placeholder="Escribe aquí el comunicado oficial..." 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  required
                />
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '16px' }} 
                disabled={submitting}
              >
                {submitting ? <Loader2 className="animate-spin" /> : (
                  <>
                    <PlusCircle size={20} />
                    Publicar Comunicado
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </main>
  );
};

export default Admin;
