import { User, Briefcase, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12 md:py-4 relative transition-colors duration-300">

      <div className="max-w-5xl w-full relative z-10 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="inline-block mb-3 p-2 bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl">
            <img src="/favicon.png" alt="JanSahayak Logo" className="w-16 h-16 rounded-xl shadow-inner" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight drop-shadow-sm dark:drop-shadow-lg">
            Jan<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-600 dark:from-primary-400 dark:to-emerald-400">Sahayak</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-200 font-light max-w-2xl mx-auto leading-relaxed px-4">
            Connecting healthcare professionals and patients seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 px-4 max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/customer')}
            className="group relative bg-white dark:glass-dark border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:border-primary-300 dark:hover:border-primary-500/50 transition-all duration-500 text-left overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-600/10 dark:hover:shadow-primary-900/30"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 dark:from-primary-500/20 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
            <div className="bg-primary-50 dark:bg-primary-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 relative z-10 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/30 transition-colors shadow-inner">
              <User className="w-6 h-6 text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10 flex items-center justify-between">
              Customer
              <ArrowRight className="w-4 h-4 text-primary-600 dark:text-primary-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-200 relative z-10 leading-relaxed font-medium dark:font-light">Book services, manage devices, and track orders.</p>
          </button>

          <button
            onClick={() => navigate('/employee')}
            className="group relative bg-white dark:glass-dark border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-500 text-left overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-600/10 dark:hover:shadow-emerald-900/30"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 dark:from-emerald-500/20 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
            <div className="bg-emerald-50 dark:bg-emerald-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 relative z-10 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/30 transition-colors shadow-inner">
              <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10 flex items-center justify-between">
              Employee
              <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-200 relative z-10 leading-relaxed font-medium dark:font-light">Receive assignments, track jobs, and submit KYC.</p>
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/admin')}
            className="text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline underline-offset-4"
          >
            Are you an admin? Login here
          </button>
        </div>
        
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>© 2026 JanSahayak Ecosystem. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
