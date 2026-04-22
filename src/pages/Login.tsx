import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, LogIn, Mail, Lock, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationProvider';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { notify } = useNotification();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = isRegistering 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      notify(error.message, 'error', 'Ups! Algo salió mal');
    } else {
      notify(
        isRegistering ? '¡Cuenta creada! Revisa tu email de confirmación.' : '¡Qué bueno verte de nuevo!',
        'success'
      );
      if (!isRegistering) navigate('/');
    }
    setLoading(false);
  };

  return (
    <main style={{ 
      minHeight: 'calc(100vh - 80px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%', maxWidth: '440px' }}
      >
        <div className="card" style={{ padding: '3rem 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: 'white',
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)'
            }}>
              <Zap size={32} fill="white" />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--foreground)' }}>
              {isRegistering ? 'Únete a W.I.N.' : 'Bienvenido a W.I.N.'}
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '1rem', fontWeight: 500 }}>
              {isRegistering ? 'Crea una cuenta para tu familia' : 'Ingresa para ver los comunicados'}
            </p>
          </div>

          <form onSubmit={handleAuth}>
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--secondary)' }} />
              <input 
                className="input-field" 
                style={{ paddingLeft: '3rem' }}
                type="email" 
                placeholder="tu@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required
              />
            </div>
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--secondary)' }} />
              <input 
                className="input-field" 
                style={{ paddingLeft: '3rem' }}
                type="password" 
                placeholder="Contraseña" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
              />
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {isRegistering ? <Sparkles size={20} /> : <LogIn size={20} />}
                  {isRegistering ? 'Crear mi Cuenta' : 'Ingresar ahora'}
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              style={{ background: 'none', color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 600 }}
            >
              {isRegistering ? '¿Ya tienes cuenta? Ingresa aquí' : '¿Aún no tienes cuenta? Regístrate gratis'}
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Login;
