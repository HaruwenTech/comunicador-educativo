import { useState } from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Clock, Info, Megaphone, Calendar, ArrowRight, Users, GraduationCap } from 'lucide-react';
import type { Announcement } from '../types';
import { motion } from 'framer-motion';

interface Props {
  announcement: Announcement;
}

const AnnouncementCard = ({ announcement }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const styles = (() => {
    switch (announcement.type) {
      case 'strike': return { badge: 'badge-urgent', icon: <AlertTriangle size={18} />, label: 'PARO DOCENTE', color: '#be123c', bg: '#fff1f2', text: '#991b1b' };
      case 'early_dismissal': return { badge: 'badge-alert', icon: <Clock size={18} />, label: 'SALIDA ANTICIPADA', color: '#b45309', bg: '#fffbeb', text: '#92400e' };
      case 'urgent': return { badge: 'badge-urgent', icon: <Megaphone size={18} />, label: 'URGENTE', color: '#be123c', bg: '#fff1f2', text: '#991b1b' };
      default: return { badge: 'badge-info', icon: <Info size={18} />, label: 'COMUNICADO', color: '#1d4ed8', bg: '#eff6ff', text: '#1e40af' };
    }
  })();

  const date = new Date(announcement.created_at);
  const dateStr = isToday(date) 
    ? `Hoy, ${format(date, "d 'de' MMMM", { locale: es })}` 
    : isTomorrow(date) 
      ? `Mañana, ${format(date, "d 'de' MMMM", { locale: es })}`
      : format(date, "EEEE d 'de' MMMM", { locale: es });

  const isLongContent = announcement.content.length > 180;
  const displayedContent = isExpanded ? announcement.content : (isLongContent ? `${announcement.content.substring(0, 180)}...` : announcement.content);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card"
      style={{ 
        borderLeft: `8px solid ${styles.color}`, 
        padding: '2rem',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Accent */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: `${styles.bg}`, borderRadius: '0 0 0 100%', opacity: 0.5, zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            background: styles.bg, 
            color: styles.text, 
            padding: '0.5rem 1rem', 
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 900,
            letterSpacing: '0.05em',
            border: `1px solid ${styles.color}20`
          }}>
            {styles.icon}
            {styles.label}
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: '#64748b', 
            fontSize: '0.85rem', 
            fontWeight: 700,
            background: '#f8fafc',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <Calendar size={16} />
            <span style={{ textTransform: 'capitalize' }}>{dateStr}</span>
          </div>
        </div>
        
        <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem', color: '#0f172a', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
          {announcement.title}
        </h3>
        
        <motion.p 
          layout
          style={{ color: '#334155', fontSize: '1.15rem', lineHeight: '1.6', marginBottom: '2rem', whiteSpace: 'pre-wrap', fontWeight: 500 }}
        >
          {displayedContent}
        </motion.p>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '1.5rem',
          paddingTop: '1.5rem', 
          borderTop: '2px solid #f1f5f9'
        }}>
          {/* Target Group Block - MUCH BIGGER AND VIBRANT */}
          <div style={{ 
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            padding: '1.25rem 1.75rem',
            borderRadius: '20px',
            color: 'white',
            boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '15px' }}>
              <GraduationCap size={28} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, opacity: 0.9, letterSpacing: '0.1em' }}>DIRIGIDO A:</p>
              <h4 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, letterSpacing: '0.02em' }}>
                {announcement.grade} <span style={{ opacity: 0.7, fontSize: '0.9rem', fontWeight: 500 }}>Sección</span> {announcement.section}
              </h4>
            </div>
          </div>
          
          {isLongContent && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              style={{ 
                background: 'none',
                border: 'none',
                color: 'var(--primary)', 
                fontSize: '0.9rem', 
                fontWeight: 900, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                cursor: 'pointer',
                padding: 0,
                alignSelf: 'flex-end'
              }}
            >
              {isExpanded ? 'VER MENOS' : 'LEER MÁS DETALLES'} 
              <ArrowRight size={18} style={{ transform: isExpanded ? 'rotate(-90deg)' : 'none', transition: 'transform 0.3s' }} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AnnouncementCard;
