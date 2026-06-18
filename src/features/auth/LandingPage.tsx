import { User, Briefcase, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 py-12 md:py-4 relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-600/30 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-500/20 blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-5xl w-full relative z-10 animate-fade-in-up">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
            <img src="/favicon.png" alt="JanSahayak Logo" className="w-20 h-20 rounded-xl" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
            Jan<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">Sahayak</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            Connecting healthcare professionals and patients with absolute seamlessness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 px-4">
          <button
            onClick={() => navigate('/customer')}
            className="group relative glass-dark p-8 rounded-3xl hover:bg-slate-800/80 hover:border-primary-500/50 transition-all duration-500 text-left overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-900/30"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/20 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
            <div className="bg-primary-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:bg-primary-500/30 transition-colors">
              <User className="w-8 h-8 text-primary-400 group-hover:text-primary-300" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 relative z-10 flex items-center justify-between">
              Customer
              <ArrowRight className="w-5 h-5 text-primary-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </h2>
            <p className="text-slate-400 relative z-10 leading-relaxed font-light">Book services, manage medical devices, and track your active orders instantly.</p>
          </button>

          <button
            onClick={() => navigate('/employee')}
            className="group relative glass-dark p-8 rounded-3xl hover:bg-slate-800/80 hover:border-emerald-500/50 transition-all duration-500 text-left overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/30"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
            <div className="bg-emerald-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:bg-emerald-500/30 transition-colors">
              <Briefcase className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 relative z-10 flex items-center justify-between">
              Employee
              <ArrowRight className="w-5 h-5 text-emerald-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </h2>
            <p className="text-slate-400 relative z-10 leading-relaxed font-light">Receive real-time assignments, track job locations, and submit your KYC securely.</p>
          </button>

          <button
            onClick={() => navigate('/admin')}
            className="group relative glass-dark p-8 rounded-3xl hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all duration-500 text-left overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-900/30"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
            <div className="bg-indigo-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:bg-indigo-500/30 transition-colors">
              <Shield className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 relative z-10 flex items-center justify-between">
              Admin
              <ArrowRight className="w-5 h-5 text-indigo-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </h2>
            <p className="text-slate-400 relative z-10 leading-relaxed font-light">Manage the entire ecosystem, verify employees, and control the database.</p>
          </button>
        </div>
        
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>© 2026 JanSahayak Ecosystem. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
