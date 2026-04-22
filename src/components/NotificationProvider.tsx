import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, Bell } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'urgent';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  title?: string;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notify: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: NotificationType = 'info', title?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '1rem',
        left: '1rem',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              style={{
                background: 'white',
                color: 'var(--foreground)',
                padding: '1rem',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                pointerEvents: 'auto',
                border: `1px solid var(--border)`,
                borderLeft: `6px solid ${
                  n.type === 'success' ? 'var(--success)' : 
                  n.type === 'error' ? 'var(--danger)' : 
                  n.type === 'urgent' ? 'var(--accent)' : 'var(--primary)'
                }`
              }}
            >
              <div style={{ color: 
                n.type === 'success' ? 'var(--success)' : 
                n.type === 'error' ? 'var(--danger)' : 
                n.type === 'urgent' ? 'var(--accent)' : 'var(--primary)'
              }}>
                {n.type === 'success' && <CheckCircle size={24} />}
                {n.type === 'error' && <AlertCircle size={24} />}
                {n.type === 'urgent' && <Bell size={24} />}
                {n.type === 'info' && <Info size={24} />}
              </div>
              <div style={{ flex: 1 }}>
                {n.title && <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>{n.title}</h4>}
                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{n.message}</p>
              </div>
              <button onClick={() => remove(n.id)} style={{ background: 'none', color: 'var(--secondary)' }}>
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
