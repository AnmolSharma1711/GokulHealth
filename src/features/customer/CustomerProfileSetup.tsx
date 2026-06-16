import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { db } from '../../store/MockDatabase';
import { Profile, CustomerDetails } from '../../types/database';

interface Props {
  user: Profile;
  onComplete: (user: Profile, details: CustomerDetails) => void;
}

export function CustomerProfileSetup({ user, onComplete }: Props) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [medicalIssues, setMedicalIssues] = useState('');
  const [deviceSupport, setDeviceSupport] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    setIsSubmitting(true);

    try {
      await db.updateProfile(user.id, { name, address });
      
      const details: CustomerDetails = {
        id: user.id,
        medical_issues: medicalIssues || null,
        device_support: deviceSupport || null,
      };
      
      await db.saveCustomerDetails(details);
      
      onComplete({ ...user, name, address }, details);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 glass-card border-primary-100 shadow-xl shadow-primary-900/5 animate-fade-in-up">
      <CardHeader className="bg-primary-50/50 border-b border-primary-100/50 pb-6">
        <CardTitle className="text-3xl font-black text-primary-900 tracking-tight">Complete Your Profile</CardTitle>
        <p className="text-primary-700/80 mt-2 font-medium">Please provide your details so we can serve you better.</p>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Basic Information</h3>
            <Input
              label="Full Name *"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Complete Address *
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all shadow-sm"
                placeholder="Enter your full residential address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Medical & Device Needs</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Medical Issues / History (Optional)
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all shadow-sm"
                placeholder="Briefly describe any relevant medical history"
                value={medicalIssues}
                onChange={(e) => setMedicalIssues(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Device Support Requirements (Optional)
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all shadow-sm"
                placeholder="e.g. Needs oxygen concentrator support"
                value={deviceSupport}
                onChange={(e) => setDeviceSupport(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-6">
            <Button type="submit" fullWidth size="lg" className="bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/20 py-6 text-lg rounded-2xl" disabled={!name || !address || isSubmitting}>
              {isSubmitting ? 'Saving securely...' : 'Save Profile & Continue'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
