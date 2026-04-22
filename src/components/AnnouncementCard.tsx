import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Clock, Info, Megaphone, Calendar, ArrowRight } from 'lucide-react';
import type { Announcement } from '../types';
import { motion } from 'framer-motion';

interface Props {
  announcement: Announcement;
}

const AnnouncementCard = ({ announcement }: Props) => {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'strike':
        return { 
          badge: 'badge-urgent', 
          icon: <AlertTriangle size={16} />, 
          label: 'Paro Docente',
          color: '#be123c',
          bg: '#fff1f2'
        };
      case 'early_dismissal':
        return { 
          badge: 'badge-alert', 
          icon: <Clock size={16} />, 
          label: 'Salida Anticipada',
          color: '#b45309',
          bg: '#fffbeb'
        };
      case 'urgent':
        return { 
          badge: 'badge-urgent', 
          icon: <Megaphone size={16} />, 
          label: 'Urgente',
          color: '#be123c',
          bg: '#fff1f2'
        };
      default:
        return { 
          badge: 'badge-info', 
          icon: <Info size={16} />, 
          label: 'Comunicado',
          color: '#1d4ed8',
          bg: '#eff6ff'
        };
    }
  };

  const styles = getTypeStyles(announcement.type);
  const date = new Date(announcement.created_at);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
      className="card"
      style={{ borderLeft: `6px solid ${styles.color}`, padding: '1.5rem 2rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <span className={`badge ${styles.badge}`}>
          {styles.icon}
          {styles.label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
          <Calendar size={14} />
          {format(date, "d 'de' MMMM", { locale: es })}
        </div>
      </div>
      
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {announcement.title}
      </h3>
      
      <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
        {announcement.content}
      </p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingTop: '1.25rem', 
        borderTop: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(announcement.grade !== 'all' || announcement.section !== 'all') ? (
            <div style={{ 
              background: '#f8fafc', 
              padding: '0.3rem 0.8rem', 
              borderRadius: '8px', 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              color: '#64748b',
              border: '1px solid #e2e8f0',
              textTransform: 'uppercase'
            }}>
              DESTINO: {announcement.grade === 'all' ? 'TODA LA ESCUELA' : `${announcement.grade} - ${announcement.section}`}
            </div>
          ) : (
            <div style={{ background: '#f0fdf4', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, color: '#166534', border: '1px solid #bbf7d0' }}>
              🌍 GENERAL
            </div>
          )}
        </div>
        
        <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          Leer más <ArrowRight size={14} />
        </div>
      </div>
    </motion.div>
  );
};

export default AnnouncementCard;
