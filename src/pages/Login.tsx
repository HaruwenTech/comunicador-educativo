import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, LogIn, Mail, Lock, Sparkles, Zap, User, GraduationCap, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationProvider';
import { motion, AnimatePresence } from 'framer-motion';

const GRADES = ['1ro', '2do', '3ro', '4to', '5to', '6to'];
const SECTIONS = ['A', 'B', 'C'];

interface Child {
  grade: string;
  section: string;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [children, setChildren] = useState<Child[]>([{ grade: '', section: '' }]);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { notify } = useNotification();

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setFirstName('');
    setLastName('');
    setChildren([{ grade: '', section: '' }]);
  };

  const updateChild = (index: number, field: keyof Child, value: string) => {
    setChildren(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const addChild = () => {
    if (children.length < 4) setChildren(prev => [...prev, { grade: '', section: '' }]);
  };

  const removeChild = (index: number) => {
    if (children.length > 1) setChildren(prev => prev.filter((_, i) => i !== index));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegistering) {
      if (!firstName.trim() || !lastName.trim()) {
        notify('Por favor ingresá tu nombre y apellido', 'error');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        notify(error.message, 'error', 'Error al registrarse');
        setLoading(false);
        return;
      }

      if (data.user) {
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        // Save profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'parent',
          // Keep grade/section for backward compatibility with first child
          grade: children[0]?.grade || null,
          section: children[0]?.section || null,
        });

        // Save children with a grade selected
        const validChildren = children.filter(c => c.grade);
        if (validChildren.length > 0) {
          await supabase.from('children').insert(
            validChildren.map(c => ({ parent_id: data.user!.id, grade: c.grade, section: c.section || null }))
          );
        }
      }

      notify('¡Cuenta creada! Revisá tu email para confirmar.', 'success');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        notify(error.message, 'error', 'Error al ingresar');
      } else {
        notify('¡Bienvenido de vuelta!', 'success');
        navigate('/');
      }
    }

    setLoading(false);
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: '480px' }}>
        <div className="card" style={{ padding: '2.5rem 2rem' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 16px rgba(79,70,229,0.3)' }}>
              <Zap size={28} fill="white" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.3rem' }}>
              {isRegistering ? 'Únete a W.I.N.' : 'Bienvenido a W.I.N.'}
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
              {isRegistering ? 'Creá una cuenta para tu familia' : 'Ingresá para ver los comunicados'}
            </p>
          </div>

          <form onSubmit={handleAuth}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <AnimatePresence>
                {isRegistering && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '0.25rem' }}>
                      {/* Name */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ position: 'relative' }}>
                          <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                          <input className="input-field" style={{ paddingLeft: '2.4rem' }} type="text" placeholder="Nombre" value={firstName} onChange={e => setFirstName(e.target.value)} required={isRegistering} />
                        </div>
                        <div style={{ position: 'relative' }}>
                          <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                          <input className="input-field" style={{ paddingLeft: '2.4rem' }} type="text" placeholder="Apellido" value={lastName} onChange={e => setLastName(e.target.value)} required={isRegistering} />
                        </div>
                      </div>

                      {/* Children */}
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                          <GraduationCap size={14} /> GRADO(S) DE TUS HIJOS (opcional)
                        </label>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          {children.map((child, index) => (
                            <div key={index} style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>
                                  {children.length > 1 ? `HIJO/A ${index + 1}` : 'HIJO/A'}
                                </span>
                                {children.length > 1 && (
                                  <button type="button" onClick={() => removeChild(index)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '0.2rem 0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                              {/* Grades */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.4rem' }}>
                                {GRADES.map(g => (
                                  <button key={g} type="button" onClick={() => updateChild(index, 'grade', child.grade === g ? '' : g)}
                                    style={{ padding: '0.3rem 0.6rem', borderRadius: '7px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: '0.15s', background: child.grade === g ? 'var(--primary)' : 'white', color: child.grade === g ? 'white' : '#64748b' }}>
                                    {g}
                                  </button>
                                ))}
                              </div>
                              {/* Sections */}
                              <div style={{ display: 'flex', gap: '0.3rem' }}>
                                {SECTIONS.map(s => (
                                  <button key={s} type="button" onClick={() => updateChild(index, 'section', child.section === s ? '' : s)}
                                    style={{ padding: '0.3rem 0.65rem', borderRadius: '7px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: '0.15s', background: child.section === s ? '#10b981' : 'white', color: child.section === s ? 'white' : '#64748b' }}>
                                    Sec. {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {children.length < 4 && (
                          <button type="button" onClick={addChild}
                            style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem', borderRadius: '10px', border: '2px dashed #cbd5e1', background: 'transparent', color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: '0.2s' }}>
                            <Plus size={14} /> Agregar otro hijo/a
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                <input className="input-field" style={{ paddingLeft: '2.4rem' }} type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                <input className="input-field" style={{ paddingLeft: '2.4rem' }} type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>

              {/* Submit */}
              <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>{isRegistering ? <Sparkles size={18} /> : <LogIn size={18} />} {isRegistering ? 'Crear mi Cuenta' : 'Ingresar ahora'}</>
                )}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
            <button onClick={switchMode} style={{ background: 'none', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>
              {isRegistering ? '¿Ya tenés cuenta? Ingresá aquí' : '¿Todavía no tenés cuenta? Registrate gratis'}
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Login;
