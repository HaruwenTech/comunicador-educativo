import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Clock, Info, Megaphone, Calendar, ArrowRight } from 'lucide-react';
import type { Announcement } from '../types';
import { motion } from 'framer-motion';

interface Props {
  announcement: Announcement;
}

const AnnouncementCard = ({ announcement }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = (() => {
    switch (announcement.type) {
      case 'strike': return { badge: 'badge-urgent', icon: <AlertTriangle size={14} />, label: 'Paro Docente', color: '#be123c', bg: '#fff1f2' };
      case 'early_dismissal': return { badge: 'badge-alert', icon: <Clock size={14} />, label: 'Salida Anticipada', color: '#b45309', bg: '#fffbeb' };
      case 'urgent': return { badge: 'badge-urgent', icon: <Megaphone size={14} />, label: 'Urgente', color: '#be123c', bg: '#fff1f2' };
      default: return { badge: 'badge-info', icon: <Info size={14} />, label: 'Comunicado', color: '#1d4ed8', bg: '#eff6ff' };
    }
  })();

  const date = new Date(announcement.created_at);
  const isLongContent = announcement.content.length > 180;
  const displayedContent = isExpanded ? announcement.content : (isLongContent ? `${announcement.content.substring(0, 180)}...` : announcement.content);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card"
      style={{ 
        borderLeft: `6px solid ${styles.color}`, 
        padding: '1.5rem',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
      }}
      onClick={() => isLongContent && setIsExpanded(!isExpanded)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className={`badge ${styles.badge}`} style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', borderRadius: '100px' }}>
          {styles.icon}
          {styles.label}
        </span>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          color: '#475569', 
          fontSize: '0.8rem', 
          fontWeight: 700,
          background: '#f1f5f9',
          padding: '0.4rem 0.8rem',
          borderRadius: '100px'
        }}>
          <Calendar size={14} />
          {format(date, "d 'de' MMMM", { locale: es })}
        </div>
      </div>
      
      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b', lineHeight: '1.2' }}>
        {announcement.title}
      </h3>
      
      <motion.p 
        layout
        style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}
      >
        {displayedContent}
      </motion.p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingTop: '1.25rem', 
        borderTop: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(79, 70, 229, 0.08)', 
            padding: '0.4rem 0.9rem', 
            borderRadius: '12px', 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            color: 'var(--primary)',
            border: '1px solid rgba(79, 70, 229, 0.12)'
          }}>
            <Users size={14} />
            <span style={{ opacity: 0.8 }}>PARA:</span> {announcement.grade} {announcement.section}
          </div>
        </div>
        
        {isLongContent ? (
          <div 
            style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
          >
            {isExpanded ? 'VER MENOS' : 'LEER MÁS'} <ArrowRight size={14} style={{ transform: isExpanded ? 'rotate(-90deg)' : 'none', transition: 'transform 0.3s' }} />
          </div>
        ) : (
          <div style={{ width: '20px' }}></div>
        )}
      </div>
    </motion.div>
  );
};

export default AnnouncementCard;
