import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, LogIn, Sparkles, Zap, GraduationCap, Plus, X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationProvider';
import { motion, AnimatePresence } from 'framer-motion';

const GRADES = ['1ro', '2do', '3ro', '4to', '5to', '6to'];
const SECTIONS = ['A', 'B', 'C'];

interface Child { grade: string; section: string; }

/* ---------- small helpers ---------- */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>{label}</label>
    {children}
  </div>
);

const InputBox = ({ icon, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode; error?: string }) => (
  <div>
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: error ? '#ef4444' : '#94a3b8', display: 'flex', pointerEvents: 'none', zIndex: 1 }}>
          {icon}
        </span>
      )}
      <input
        {...props}
        className="input-field"
        style={{
          paddingLeft: icon ? '2.75rem' : '1rem',
          paddingRight: props.type === 'password' ? '3rem' : '1rem',
          borderColor: error ? '#ef4444' : 'transparent',
          ...(props.style || {})
        }}
      />
    </div>
    {error && <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>⚠ {error}</p>}
  </div>
);

/* ---------------------------------- */

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [children, setChildren] = useState<Child[]>([{ grade: '', section: '' }]);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { notify } = useNotification();

  const switchMode = () => {
    setIsRegistering(v => !v);
    setErrors({});
    setFirstName(''); setLastName('');
    setChildren([{ grade: '', section: '' }]);
    setShowPassword(false);
  };

  const updateChild = (i: number, field: keyof Child, val: string) =>
    setChildren(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val === c[field] ? '' : val } : c));

  const addChild = () => { if (children.length < 4) setChildren(p => [...p, { grade: '', section: '' }]); };
  const removeChild = (i: number) => { if (children.length > 1) setChildren(p => p.filter((_, idx) => idx !== i)); };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (isRegistering) {
      if (!firstName.trim()) errs.firstName = 'Ingresá tu nombre';
      if (!lastName.trim()) errs.lastName = 'Ingresá tu apellido';
    }
    if (!email.trim()) errs.email = 'Ingresá tu email';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email inválido';
    if (!password) errs.password = 'Ingresá tu contraseña';
    else if (password.length < 6) errs.password = 'Mínimo 6 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    if (isRegistering) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { notify(error.message, 'error', 'Error al registrarse'); setLoading(false); return; }

      if (data.user) {
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        await supabase.from('profiles').upsert({
          id: data.user.id, email, full_name: fullName, role: 'parent',
          grade: children[0]?.grade || null,
          section: children[0]?.section || null,
        });
        const validChildren = children.filter(c => c.grade);
        if (validChildren.length > 0) {
          await supabase.from('children').insert(validChildren.map(c => ({ parent_id: data.user!.id, grade: c.grade, section: c.section || null })));
        }
      }
      notify('¡Cuenta creada! Revisá tu email para confirmar.', 'success');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { notify(error.message, 'error', 'Error al ingresar'); }
      else { notify('¡Bienvenido de vuelta!', 'success'); navigate('/'); }
    }
    setLoading(false);
  };

  /* Eye button for password */
  const EyeBtn = () => (
    <button
      type="button"
      onClick={() => setShowPassword(v => !v)}
      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', zIndex: 1 }}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <main style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: '460px' }}>
        <div className="card" style={{ padding: '2.5rem 2rem' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: 'linear-gradient(135deg,#4f46e5,#3730a3)', color: 'white', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 20px rgba(79,70,229,0.35)' }}>
              <Zap size={28} fill="white" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {isRegistering ? 'Únete a W.I.N.' : 'Bienvenido a W.I.N.'}
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
              {isRegistering ? 'Creá una cuenta para tu familia' : 'Ingresá para ver los comunicados'}
            </p>
          </div>

          <form onSubmit={handleAuth} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* ——— Registration-only fields ——— */}
              <AnimatePresence>
                {isRegistering && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingBottom: '0.1rem' }}>

                      {/* Name row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <Field label="NOMBRE">
                          <input
                            className="input-field"
                            type="text"
                            placeholder="María"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            style={{ borderColor: errors.firstName ? '#ef4444' : 'transparent' }}
                          />
                          {errors.firstName && <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>⚠ {errors.firstName}</p>}
                        </Field>
                        <Field label="APELLIDO">
                          <input
                            className="input-field"
                            type="text"
                            placeholder="García"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            style={{ borderColor: errors.lastName ? '#ef4444' : 'transparent' }}
                          />
                          {errors.lastName && <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>⚠ {errors.lastName}</p>}
                        </Field>
                      </div>

                      {/* Children */}
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>
                          <GraduationCap size={14} /> GRADO(S) DE TUS HIJOS (opcional)
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {children.map((child, idx) => (
                            <div key={idx} style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)' }}>{children.length > 1 ? `HIJO/A ${idx + 1}` : 'HIJO/A'}</span>
                                {children.length > 1 && (
                                  <button type="button" onClick={() => removeChild(idx)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '0.2rem 0.4rem', cursor: 'pointer', display: 'flex' }}>
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.4rem' }}>
                                {GRADES.map(g => (
                                  <button key={g} type="button" onClick={() => updateChild(idx, 'grade', g)}
                                    style={{ padding: '0.3rem 0.65rem', borderRadius: '8px', border: 'none', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: '0.15s', background: child.grade === g ? 'var(--primary)' : 'white', color: child.grade === g ? 'white' : '#64748b' }}>
                                    {g}
                                  </button>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: '0.3rem' }}>
                                {SECTIONS.map(s => (
                                  <button key={s} type="button" onClick={() => updateChild(idx, 'section', s)}
                                    style={{ padding: '0.3rem 0.7rem', borderRadius: '8px', border: 'none', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: '0.15s', background: child.section === s ? '#10b981' : 'white', color: child.section === s ? 'white' : '#64748b' }}>
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

              {/* ——— Email ——— */}
              <Field label="EMAIL">
                <InputBox
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  error={errors.email}
                />
              </Field>

              {/* ——— Password ——— */}
              <Field label="CONTRASEÑA">
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-field"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isRegistering ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingRight: '3rem', borderColor: errors.password ? '#ef4444' : 'transparent' }}
                  />
                  <EyeBtn />
                </div>
                {errors.password && <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>⚠ {errors.password}</p>}
                {isRegistering && password.length > 0 && password.length < 6 && (
                  <div style={{ display: 'flex', gap: '3px', marginTop: '0.4rem' }}>
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: password.length >= i * 1 ? (password.length < 4 ? '#ef4444' : password.length < 6 ? '#f59e0b' : '#10b981') : '#e2e8f0', transition: '0.3s' }} />
                    ))}
                  </div>
                )}
              </Field>

              {/* ——— Submit ——— */}
              <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '0.25rem' }} disabled={loading}>
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
