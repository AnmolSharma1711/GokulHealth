import { useState, useEffect } from 'react';
import { CustomerAuth } from './CustomerAuth';
import { CustomerProfileSetup } from './CustomerProfileSetup';
import { CustomerDashboard } from './CustomerDashboard';
import { Profile, CustomerDetails } from '../../types/database';
import { db } from '../../store/MockDatabase';

export function CustomerApp() {
  const [user, setUser] = useState<Profile | null>(null);
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.name && user.address) {
      setIsLoading(true);
      db.getCustomerDetails(user.id).then(d => {
        setDetails(d);
        setIsLoading(false);
      });
    }
  }, [user]);

  if (!user) {
    return <CustomerAuth onLogin={setUser} />;
  }

  const needsProfileSetup = !user.name || !user.address || (!details && !isLoading);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-primary-600">Customer Portal</h1>
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
          {needsProfileSetup ? (
            <CustomerProfileSetup 
              user={user} 
              onComplete={(updatedUser, newDetails) => {
                setUser(updatedUser);
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
