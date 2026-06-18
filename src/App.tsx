import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { CustomerApp } from './features/customer/CustomerApp';
import { EmployeeApp } from './features/employee/EmployeeApp';
import { AdminApp } from './features/admin/AdminApp';
import { LandingPage } from './features/auth/LandingPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/common/ThemeToggle';

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
        <ThemeToggle />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
