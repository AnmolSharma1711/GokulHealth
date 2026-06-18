import { useState, useEffect } from 'react';
import { Profile, EmployeeDetails, Order } from '../../types/database';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { db } from '../../store/MockDatabase';
import { Clock, MapPin, BriefcaseMedical, CheckCircle, History, Sparkles, User } from 'lucide-react';
import { ProfileEditor } from '../../components/common/ProfileEditor';

interface Props {
  user: Profile;
  details: EmployeeDetails;
}

export function EmployeeDashboard({ user, details }: Props) {
  const [jobs, setJobs] = useState<Order[]>([]);
  const [view, setView] = useState<'active' | 'history' | 'profile'>('active');

  const fetchJobs = async () => {
    const fetchedJobs = await db.getOrdersByEmployee(user.id);
    setJobs(fetchedJobs);
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000); 
    return () => clearInterval(interval);
  }, [user.id]);

  const handleMarkCompleted = async (orderId: string, customerId: string) => {
    await db.markOrderCompleted(orderId);
    await db.createNotification("Job Completed", "Your assigned employee has completed the service.", "customer", customerId);
    fetchJobs();
  };

  if (details.kyc_status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center p-10 glass-card bg-amber-50/80 rounded-3xl border border-amber-200/50 animate-fade-in-up">
        <div className="w-24 h-24 bg-amber-100/50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 border-4 border-amber-400 rounded-full border-t-transparent animate-spin"></div>
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-3xl font-black text-amber-900 mb-3 tracking-tight">Verification Pending</h2>
        <p className="text-amber-700/80 text-lg leading-relaxed">
          Your KYC documents have been submitted and are currently under review by our Admin team. 
          You will be notified once your profile is verified.
        </p>
      </div>
    );
  }

  if (details.kyc_status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center p-10 glass-card bg-red-50/80 rounded-3xl border border-red-200/50 animate-fade-in-up">
        <h2 className="text-3xl font-black text-red-900 mb-3 tracking-tight">Verification Rejected</h2>
        <p className="text-red-700/80 text-lg">Please contact support for more information.</p>
      </div>
    );
  }

  const activeJobs = jobs.filter(j => j.order_status === 'assigned');
  const completedJobs = jobs.filter(j => j.order_status === 'completed');
  const displayedJobs = view === 'active' ? activeJobs : completedJobs;

  if (view === 'profile') {
    return (
      <div className="space-y-8 pb-28">
        <ProfileEditor profile={user} />
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/50 px-6 pt-4 flex justify-around items-center z-50 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-3xl">
          <button 
            onClick={() => setView('active')}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${view === 'active' ? 'text-emerald-600 transform -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`relative p-2 rounded-xl ${view === 'active' ? 'bg-emerald-50' : ''}`}>
              <Clock className="w-6 h-6" />
              {activeJobs.length > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse" />}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Jobs</span>
          </button>
          
          <button 
            onClick={() => setView('history')}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${view === 'history' ? 'text-emerald-600 transform -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'history' ? 'bg-emerald-50' : ''}`}>
              <History className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider">History</span>
          </button>

          <button 
            onClick={() => setView('profile')}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${view === 'profile' ? 'text-emerald-600 transform -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'profile' ? 'bg-emerald-50' : ''}`}>
              <User className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider">Profile</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-28">
      <div className="glass p-8 rounded-3xl relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Assignments</h2>
            <p className="text-slate-500 mt-1 text-lg">Currently managing <strong className="text-emerald-600">{activeJobs.length}</strong> active jobs.</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-100/50 px-5 py-2.5 rounded-2xl font-bold text-sm backdrop-blur-sm border border-emerald-200/50 shadow-sm">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Verified Employee
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {displayedJobs.length === 0 ? (
          <div className="col-span-full p-16 text-center text-slate-500 glass-card rounded-3xl border border-slate-200/50 border-dashed">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium">{view === 'active' ? 'No active jobs assigned to you right now.' : 'You have not completed any jobs yet.'}</p>
          </div>
        ) : (
          displayedJobs.map((job) => (
            <Card key={job.id} className="glass-card border-emerald-100/50 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 relative overflow-hidden group hover:-translate-y-1">
              {job.order_status === 'completed' && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] uppercase tracking-wider font-black px-4 py-1.5 rounded-bl-2xl shadow-sm z-10">
                  COMPLETED
                </div>
              )}
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">{job.service_device_type}</h3>
                    <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Duration: {job.duration_months} Months
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <BriefcaseMedical className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                
                <div className="space-y-6 mt-6 pt-6 border-t border-slate-100/50 relative">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Age</p>
                      <p className="text-sm font-medium text-slate-900 mt-1">{job.patient_age || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Timing</p>
                      <p className="text-sm font-medium text-slate-900 mt-1">{job.time_each_day || 'Not specified'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</p>
                      <p className="text-sm font-medium text-slate-900 mt-1">{job.start_date || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Date</p>
                      <p className="text-sm font-medium text-slate-900 mt-1">{job.end_date || 'N/A'}</p>
                    </div>
                    {job.service_details && (
                      <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additional Details</p>
                        <p className="text-sm font-medium text-slate-900 mt-1 italic">{job.service_details}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-slate-50 p-2 rounded-xl mt-0.5">
                      <MapPin className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Customer Reference</p>
                      <p className="text-base font-medium text-slate-900 mt-1">{job.customer_id.substring(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  
                  {job.order_status === 'assigned' && (
                    <Button fullWidth size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 py-6 text-lg rounded-2xl" onClick={() => handleMarkCompleted(job.id, job.customer_id)}>
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/50 dark:border-slate-800 px-6 pt-4 flex justify-around items-center z-50 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-black/20 rounded-t-3xl transition-colors duration-300">
        <button 
          onClick={() => setView('active')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${view === 'active' ? 'text-emerald-600 transform -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`relative p-2 rounded-xl ${view === 'active' ? 'bg-emerald-50' : ''}`}>
            <Clock className="w-6 h-6" />
            {activeJobs.length > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse" />}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Active Jobs</span>
        </button>
        
        <button 
          onClick={() => setView('history')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${view === 'history' ? 'text-emerald-600 transform -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-2 rounded-xl ${view === 'history' ? 'bg-emerald-50' : ''}`}>
            <History className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">History</span>
        </button>

        <button 
          onClick={() => setView('profile')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${view === 'profile' ? 'text-emerald-600 transform -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-2 rounded-xl ${view === 'profile' ? 'bg-emerald-50' : ''}`}>
            <User className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </div>
    </div>
  );
}
