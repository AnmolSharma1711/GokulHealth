import { useState, useEffect } from 'react';
import { Profile, EmployeeDetails, Order } from '../../types/database';
import { Card, CardContent } from '../../components/common/Card';
import { db } from '../../store/MockDatabase';
import { Clock, MapPin, BriefcaseMedical, CheckCircle } from 'lucide-react';

interface Props {
  user: Profile;
  details: EmployeeDetails;
}

export function EmployeeDashboard({ user, details }: Props) {
  const [assignedJobs, setAssignedJobs] = useState<Order[]>([]);

  const fetchJobs = async () => {
    const jobs = await db.getOrdersByEmployee(user.id);
    setAssignedJobs(jobs);
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000); // Poll for mock push notification
    return () => clearInterval(interval);
  }, [user.id]);

  if (details.kyc_status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center p-8 bg-amber-50 rounded-2xl border border-amber-200">
        <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-amber-900 mb-2">Verification Pending</h2>
        <p className="text-amber-700">
          Your KYC documents have been submitted and are currently under review by our Admin team. 
          You will be notified once your profile is verified.
        </p>
      </div>
    );
  }

  if (details.kyc_status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center p-8 bg-red-50 rounded-2xl border border-red-200">
        <h2 className="text-2xl font-bold text-red-900 mb-2">Verification Rejected</h2>
        <p className="text-red-700">Please contact support for more information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your Assigned Jobs</h2>
          <p className="text-slate-500">Currently managing {assignedJobs.length} active assignments.</p>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full font-medium text-sm">
          <CheckCircle className="w-4 h-4" />
          Verified Employee
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignedJobs.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            No active jobs assigned to you right now.
          </div>
        ) : (
          assignedJobs.map((job) => (
            <Card key={job.id} className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{job.service_device_type}</h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      Duration: {job.duration_months} Months
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg">
                    <BriefcaseMedical className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                
                <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Customer Location</p>
                      <p className="text-sm font-medium text-slate-900 mt-0.5">Fetching Address... (Ref: {job.customer_id.substring(0, 8)})</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
