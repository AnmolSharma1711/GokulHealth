import { useState, useEffect } from 'react';
import { CustomerAuth } from './CustomerAuth';
import { CustomerProfileSetup } from './CustomerProfileSetup';
import { CustomerDashboard } from './CustomerDashboard';
import { CustomerDetails } from '../../types/database';
import { db } from '../../store/MockDatabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function CustomerApp() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    if (user && user.name && user.address) {
      setIsDetailsLoading(true);
      db.getCustomerDetails(user.id).then(d => {
        setDetails(d);
        setIsDetailsLoading(false);
      });
    }
  }, [user]);

  if (!user) {
    return <CustomerAuth onLogin={login} />;
  }

  const needsProfileSetup = !user.name || !user.address || !details;

  return (
    <div className="h-[100dvh] bg-slate-50 dark:bg-transparent flex flex-col overflow-hidden transition-colors duration-300">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 pt-safe flex justify-between items-center shadow-sm shrink-0 z-10">
        <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Customer Portal</h1>
        <button 
          onClick={() => {
            setDetails(null);
            logout();
            navigate('/');
          }}
          className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Logout
        </button>
      </header>
      
      <main className="flex-1 p-6 overflow-y-auto relative">
        <div className="max-w-5xl mx-auto">
          {isDetailsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : needsProfileSetup ? (
            <CustomerProfileSetup 
              user={user} 
              onComplete={(updatedUser, newDetails) => {
                login(updatedUser);
                setDetails(newDetails);
              }} 
            />
          ) : (
            <CustomerDashboard user={user} details={details!} />
          )}
        </div>
      </main>
    </div>
  );
}
