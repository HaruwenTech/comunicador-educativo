import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types';

// Known super admin emails — immediate role detection while DB loads
const SUPER_ADMINS = ['melina.figueroa.89@gmail.com'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedFor = useRef<string | null>(null); // prevent double-fetch

  const fetchProfile = async (authUser: User) => {
    // Already fetching for this user — skip
    if (fetchedFor.current === authUser.id) return;
    fetchedFor.current = authUser.id;

    // ① Optimistic: set role immediately from known list so UI doesn't wait
    if (SUPER_ADMINS.includes(authUser.email ?? '')) {
      setProfile(prev => prev ?? {
        id: authUser.id,
        email: authUser.email ?? '',
        full_name: '',
        role: 'super_admin',
        grade: null,
        section: null,
      });
    }

    // ② Fetch real profile from DB
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!error && data) {
        setProfile(data);
      } else {
        // Fallback — use email to determine role
        setProfile({
          id: authUser.id,
          email: authUser.email ?? '',
          full_name: authUser.email?.split('@')[0] ?? 'Usuario',
          role: SUPER_ADMINS.includes(authUser.email ?? '') ? 'super_admin' : 'parent',
          grade: null,
          section: null,
        });
      }
    } catch {
      // Network error — still show something usable
      setProfile({
        id: authUser.id,
        email: authUser.email ?? '',
        full_name: authUser.email?.split('@')[0] ?? 'Usuario',
        role: SUPER_ADMINS.includes(authUser.email ?? '') ? 'super_admin' : 'parent',
        grade: null,
        section: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Hard timeout — never leave user on loading screen
    const timer = setTimeout(() => setLoading(false), 4000);

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u);
      else setLoading(false);
    });

    // Auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u);
      } else {
        // Signed out — clear everything
        fetchedFor.current = null;
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const signOut = async () => {
    fetchedFor.current = null;
    setProfile(null);
    setUser(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
