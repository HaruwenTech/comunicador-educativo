import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ 
      marginTop: 'auto', 
      padding: '2rem 0', 
      borderTop: '1px solid var(--border)',
      background: 'white',
      textAlign: 'center'
    }}>
      <div className="container">
        <p style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem',
          color: 'var(--secondary)',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          Hecho con <Heart size={16} fill="var(--danger)" color="var(--danger)" /> por 
          <span style={{ 
            background: 'linear-gradient(90deg, var(--primary), var(--primary-dark))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800
          }}>
            HaruwenTech
          </span>
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          © {new Date().getFullYear()} W.I.N. - Wayen Info Network
        </p>
      </div>
    </footer>
  );
};

export default Footer;
