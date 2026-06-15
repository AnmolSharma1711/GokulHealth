import { User, Briefcase, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Booking Ecosystem</h1>
          <p className="text-lg text-slate-600">Please select your portal to login or register</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/customer')}
            className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-primary-500 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <User className="w-10 h-10 text-primary-600 mb-6 relative z-10" />
            <h2 className="text-2xl font-semibold text-slate-900 mb-2 relative z-10">Customer</h2>
            <p className="text-slate-500 relative z-10">Book services, manage devices, and track your active orders.</p>
          </button>

          <button
            onClick={() => navigate('/employee')}
            className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-500 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <Briefcase className="w-10 h-10 text-emerald-600 mb-6 relative z-10" />
            <h2 className="text-2xl font-semibold text-slate-900 mb-2 relative z-10">Employee</h2>
            <p className="text-slate-500 relative z-10">Receive assignments, track job locations, and submit KYC.</p>
          </button>

          <button
            onClick={() => navigate('/admin')}
            className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-500 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <Shield className="w-10 h-10 text-indigo-600 mb-6 relative z-10" />
            <h2 className="text-2xl font-semibold text-slate-900 mb-2 relative z-10">Admin</h2>
            <p className="text-slate-500 relative z-10">Manage employees, verify KYC, and monitor overall system health.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
