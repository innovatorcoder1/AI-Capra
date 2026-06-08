import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({});

const LOCAL_USER_KEY = 'ai_capra_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for a locally stored webhook-authenticated user first
    try {
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
        setLoading(false);
        return;
      }
    } catch (e) {}

    // 2. Fall back to Supabase session (for Google OAuth, etc.)
    if (!supabase) {
      setLoading(false);
      return;
    }

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Auth initialization error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Custom login for webhook-authenticated users
  const loginWithWebhook = (userData) => {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  // Sign out clears both local storage and Supabase session
  const signOut = async () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const value = {
    signUp: (data) => supabase?.auth.signUp(data),
    signIn: (data) => supabase?.auth.signInWithPassword(data),
    signInWithGoogle: () => supabase?.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/chat'
      }
    }),
    loginWithWebhook,
    signOut,
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
