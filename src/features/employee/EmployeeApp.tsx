import { useState, useEffect } from 'react';
import { EmployeeAuth } from './EmployeeAuth';
import { EmployeeKYCSetup } from './EmployeeKYCSetup';
import { EmployeeDashboard } from './EmployeeDashboard';
import { EmployeeDetails } from '../../types/database';
import { db } from '../../store/MockDatabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function EmployeeApp() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState<EmployeeDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    if (user && user.name && user.address) {
      setIsDetailsLoading(true);
      const fetchDetails = async () => {
        const d = await db.getEmployeeDetails(user.id);
        setDetails(d);
      };
      
      fetchDetails().then(() => setIsDetailsLoading(false));
      
      const interval = setInterval(fetchDetails, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) {
    return <EmployeeAuth onLogin={login} />;
  }

  const needsKYCSetup = !user.name || !user.address || !details;

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-emerald-200 px-6 py-4 pt-safe flex justify-between items-center shadow-sm shrink-0 z-10">
        <h1 className="text-xl font-bold text-emerald-600">Employee Portal</h1>
        <button 
          onClick={() => {
            setDetails(null);
            logout();
            navigate('/');
          }}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          Logout
        </button>
      </header>
      
      <main className="flex-1 p-6 overflow-y-auto relative">
        <div className="max-w-5xl mx-auto">
          {isDetailsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : needsKYCSetup ? (
            <EmployeeKYCSetup 
              user={user} 
              onComplete={(updatedUser, newDetails) => {
                login(updatedUser);
                setDetails(newDetails);
              }} 
            />
          ) : (
            <EmployeeDashboard user={user} details={details!} />
          )}
        </div>
      </main>
    </div>
  );
}
