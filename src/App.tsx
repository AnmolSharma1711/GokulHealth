import { useState } from 'react';
import { CustomerApp } from './features/customer/CustomerApp';
import { EmployeeApp } from './features/employee/EmployeeApp';
import { AdminApp } from './features/admin/AdminApp';
import { Shield, User, Briefcase, LayoutDashboard } from 'lucide-react';

type ViewMode = 'switcher' | 'customer' | 'employee' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('switcher');

  if (currentView === 'switcher') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Booking Ecosystem</h1>
            <p className="text-lg text-slate-600">Select a portal to preview the interface</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setCurrentView('customer')}
              className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-primary-500 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              <User className="w-10 h-10 text-primary-600 mb-6 relative z-10" />
              <h2 className="text-2xl font-semibold text-slate-900 mb-2 relative z-10">Customer App</h2>
              <p className="text-slate-500 relative z-10">Mobile interface for booking services, devices, and managing orders.</p>
            </button>

            <button
              onClick={() => setCurrentView('employee')}
              className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-500 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              <Briefcase className="w-10 h-10 text-emerald-600 mb-6 relative z-10" />
              <h2 className="text-2xl font-semibold text-slate-900 mb-2 relative z-10">Employee App</h2>
              <p className="text-slate-500 relative z-10">Mobile interface for receiving jobs, KYC onboarding, and status tracking.</p>
            </button>

            <button
              onClick={() => setCurrentView('admin')}
              className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-500 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              <Shield className="w-10 h-10 text-indigo-600 mb-6 relative z-10" />
              <h2 className="text-2xl font-semibold text-slate-900 mb-2 relative z-10">Admin Dashboard</h2>
              <p className="text-slate-500 relative z-10">Desktop interface for matching orders, verifying KYC, and sending notifications.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <button
        onClick={() => setCurrentView('switcher')}
        className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 pr-5"
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="font-medium text-sm">Switch View</span>
      </button>

      {currentView === 'customer' && <CustomerApp />}
      {currentView === 'employee' && <EmployeeApp />}
      {currentView === 'admin' && <AdminApp />}
    </div>
  );
}

export default App;
