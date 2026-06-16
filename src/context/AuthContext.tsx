import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile } from '../types/database';
import { db } from '../store/MockDatabase';

interface Session {
  id: string;
  role: 'customer' | 'employee' | 'admin';
}

interface AuthContextType {
  session: Session | null;
  user: Profile | null;
  login: (user: Profile) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedSession = localStorage.getItem('booking_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession) as Session;
          const profile = await db.getProfileById(parsed.id);
          if (profile) {
            setSession(parsed);
            setUser(profile);
          } else {
            localStorage.removeItem('booking_session');
          }
        } catch (e) {
          console.error(e);
          localStorage.removeItem('booking_session');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = (newUser: Profile) => {
    const newSession = { id: newUser.id, role: newUser.role as 'customer' | 'employee' | 'admin' };
    localStorage.setItem('booking_session', JSON.stringify(newSession));
    setSession(newSession);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('booking_session');
    setSession(null);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ session, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
