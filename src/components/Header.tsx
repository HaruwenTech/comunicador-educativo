import { Zap, Shield, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="header">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', 
            color: 'white', 
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}>
            <Zap size={22} fill="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(90deg, var(--foreground), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              W.I.N.
            </h1>
            <p style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--secondary)', marginTop: '-0.2rem', opacity: 0.8 }}>Wayen Info Network</p>
          </div>
        </Link>
        
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem', background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)' }}>
                {profile?.role === 'super_admin' ? 'Super Admin' : profile?.role === 'admin' ? 'Admin' : 'Padre'}
              </span>
            </div>
          )}

          {user && (profile?.role === 'admin' || profile?.role === 'super_admin') && (
            <Link to="/admin" style={{ 
              textDecoration: 'none',
              padding: '0.5rem 1rem', 
              borderRadius: '12px',
              background: location.pathname === '/admin' ? 'var(--primary)' : 'transparent',
              color: location.pathname === '/admin' ? 'white' : 'var(--foreground)',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Shield size={18} />
              <span className="hide-mobile">Panel</span>
            </Link>
          )}

          {user && (
            <button 
              onClick={signOut}
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', width: '38px', height: '38px', borderRadius: '12px' }}
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
