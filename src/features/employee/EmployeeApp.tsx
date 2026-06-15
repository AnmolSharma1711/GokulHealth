import { useState, useEffect } from 'react';
import { EmployeeAuth } from './EmployeeAuth';
import { EmployeeKYCSetup } from './EmployeeKYCSetup';
import { EmployeeDashboard } from './EmployeeDashboard';
import { Profile, EmployeeDetails } from '../../types/database';
import { db } from '../../store/MockDatabase';

export function EmployeeApp() {
  const [user, setUser] = useState<Profile | null>(null);
  const [details, setDetails] = useState<EmployeeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.name && user.address) {
      setIsLoading(true);
      db.getEmployeeDetails(user.id).then(d => {
        setDetails(d);
        setIsLoading(false);
      });
    }
  }, [user]);

  if (!user) {
    return <EmployeeAuth onLogin={setUser} />;
  }

  const needsKYCSetup = !user.name || !user.address || (!details && !isLoading);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-emerald-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-emerald-600">Employee Portal</h1>
        <button 
          onClick={() => {
            setUser(null);
            setDetails(null);
          }}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          Logout
        </button>
      </header>
      
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          {needsKYCSetup ? (
            <EmployeeKYCSetup 
              user={user} 
              onComplete={(updatedUser, newDetails) => {
                setUser(updatedUser);
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
