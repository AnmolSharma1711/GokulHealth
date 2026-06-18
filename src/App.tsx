import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { CustomerApp } from './features/customer/CustomerApp';
import { EmployeeApp } from './features/employee/EmployeeApp';
import { AdminApp } from './features/admin/AdminApp';
import { LandingPage } from './features/auth/LandingPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function RequireAuth({ role, children }: { role: 'customer' | 'employee' | 'admin', children: JSX.Element }) {
  const { session, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Allow passing through to the auth screens if not logged in
  // Wait, if we use RequireAuth, we should let the App component handle its own auth screens.
  // Actually, let's just use the router to protect the routes. 
  // Wait, the user said "login screens should be different".
  // So CustomerApp has CustomerAuth inside it. If session is empty, CustomerApp shows CustomerAuth.
  // If session is NOT empty but role doesn't match, we should redirect them to their actual role.
  if (session && session.role !== role) {
    return <Navigate to={`/${session.role}`} replace />;
  }

  return children;
}

function BackButtonHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const listenToBackButton = async () => {
      await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          navigate(-1);
        } else {
          CapacitorApp.exitApp();
        }
      });
    };
    
    listenToBackButton();
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [navigate]);

  return null;
}

import { useNotifications } from './hooks/useNotifications';

function BackgroundEffects() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 hidden dark:block transition-opacity duration-1000">
      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-600/30 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-500/20 blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}

function AppRoutes() {
  const { session, isLoading } = useAuth();
  useNotifications();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <BackButtonHandler />
      <Routes>
        <Route 
          path="/" 
          element={
            session ? <Navigate to={`/${session.role}`} replace /> : <LandingPage />
          } 
        />
        <Route 
          path="/customer/*" 
          element={
            <RequireAuth role="customer">
              <CustomerApp />
            </RequireAuth>
          } 
        />
        <Route 
          path="/employee/*" 
          element={
            <RequireAuth role="employee">
              <EmployeeApp />
            </RequireAuth>
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            <RequireAuth role="admin">
              <AdminApp />
            </RequireAuth>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="relative min-h-screen">
          <BackgroundEffects />
          <div className="relative z-10">
            <AppRoutes />
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
