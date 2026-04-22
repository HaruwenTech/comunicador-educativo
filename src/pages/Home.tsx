import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Announcement } from '../types';
import AnnouncementCard from '../components/AnnouncementCard';
import { Loader2, RefreshCw, Bell, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const { profile } = useAuth();
  const { notify } = useNotification();

  const grades = ['all', '1ro', '2do', '3ro', '4to', '5to', '6to'];
  const sections = ['all', 'A', 'B', 'C'];

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      let filtered = data;
      if (selectedGrade !== 'all') {
        filtered = filtered.filter(a => a.grade.includes(selectedGrade) || a.grade.includes('Todas'));
      }
      if (selectedSection !== 'all') {
        filtered = filtered.filter(a => a.section.includes(selectedSection) || a.section.includes('Todas'));
      }
      setAnnouncements(filtered);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();

    const subscription = supabase
      .channel('public:announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
        const newAnn = payload.new as Announcement;
        if (newAnn.type === 'urgent' || newAnn.type === 'early_dismissal') {
          notify(newAnn.title, 'urgent', 'AVISO IMPORTANTE');
        } else {
          notify('Nuevo aviso publicado', 'info');
        }
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedGrade, selectedSection]);

  return (
    <main style={{ paddingBottom: '5rem' }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', 
        padding: '4rem 1.5rem', 
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}
          >
            ¡Hola, {profile?.full_name?.split(' ')[0] || 'Familia'}!
          </motion.h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Mantente informado con las últimas novedades y comunicados oficiales de la institución.
          </p>
        </div>
        
        {/* Background shapes for aesthetic */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
      </div>

      <div className="container">
        {/* Dashboard-like Controls */}
        <div style={{ 
          marginTop: '-4rem', 
          background: 'white', 
          padding: '1.5rem 2rem', 
          borderRadius: '24px', 
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '0.5rem', borderRadius: '10px', color: 'var(--primary)' }}>
                <LayoutDashboard size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem' }}>Panel de Filtros</h3>
            </div>
            <button 
              onClick={() => {
                if ('Notification' in window) Notification.requestPermission().then(() => notify('Notificaciones activadas', 'success'));
              }}
              style={{ padding: '0.6rem 1rem', background: '#f8fafc', border: '1px solid var(--border)', fontSize: '0.875rem' }}
            >
              <Bell size={18} />
              Recibir Alertas
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'var(--secondary)' }} />
              <select 
                className="input-field" 
                style={{ paddingLeft: '2.5rem' }}
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                {grades.map(g => <option key={g} value={g}>{g === 'all' ? 'Todos los grados' : g}</option>)}
              </select>
            </div>
            <select 
              className="input-field" 
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              {sections.map(s => <option key={s} value={s}>{s === 'all' ? 'Todas las secciones' : `Sección ${s}`}</option>)}
            </select>
          </div>
        </div>

        {/* Announcements List */}
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Comunicados</h2>
            <button 
              onClick={fetchAnnouncements} 
              style={{ background: 'none', color: 'var(--primary)', padding: '0.5rem' }}
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {loading && announcements.length === 0 ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}
              >
                <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} size={40} />
              </motion.div>
            ) : announcements.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '24px', border: '2px dashed var(--border)' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <h3 style={{ marginBottom: '0.5rem' }}>No hay anuncios todavía</h3>
                <p style={{ color: 'var(--secondary)' }}>Relájate, no hay novedades para los filtros seleccionados.</p>
              </motion.div>
            ) : (
              <motion.div 
                layout
                style={{ display: 'grid', gap: '1.5rem' }}
              >
                {announcements.map((announcement) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default Home;
