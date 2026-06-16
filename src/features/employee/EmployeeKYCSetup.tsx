import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { db } from '../../store/MockDatabase';
import { Profile, EmployeeDetails, ShiftPreference } from '../../types/database';

interface Props {
  user: Profile;
  onComplete: (user: Profile, details: EmployeeDetails) => void;
}

export function EmployeeKYCSetup({ user, onComplete }: Props) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [experience, setExperience] = useState('');
  const [shiftPref, setShiftPref] = useState<ShiftPreference>('morning');
  const [kycDoc, setKycDoc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !experience || !kycDoc) return;
    setIsSubmitting(true);

    try {
      await db.updateProfile(user.id, { name, address });
      
      const details: EmployeeDetails = {
        id: user.id,
        experience,
        shift_preference: shiftPref,
        kyc_status: 'pending',
        kyc_document_details: kycDoc,
      };
      
      await db.saveEmployeeDetails(details);
      
      onComplete({ ...user, name, address }, details);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 glass-card border-emerald-100 shadow-xl shadow-emerald-900/5 animate-fade-in-up">
      <CardHeader className="bg-emerald-50/50 border-b border-emerald-100/50 pb-6">
        <CardTitle className="text-3xl font-black text-emerald-900 tracking-tight">KYC & Onboarding</CardTitle>
        <p className="text-emerald-700/80 mt-2 font-medium">Submit your details to get verified and start receiving jobs.</p>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Basic Information</h3>
            <Input
              label="Full Name *"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Complete Address *
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all shadow-sm"
                placeholder="Enter your residential address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <Input
              label="Professional Experience *"
              placeholder="e.g. 5 years in general nursing"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
            />
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Shift Preferences</h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="shift"
                    value="morning"
                    checked={shiftPref === 'morning'}
                    onChange={() => setShiftPref('morning')}
                    className="w-5 h-5 text-emerald-600 border-slate-300 focus:ring-emerald-500 focus:ring-offset-emerald-50"
                  />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">Morning Shift</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="shift"
                    value="evening"
                    checked={shiftPref === 'evening'}
                    onChange={() => setShiftPref('evening')}
                    className="w-5 h-5 text-emerald-600 border-slate-300 focus:ring-emerald-500 focus:ring-offset-emerald-50"
                  />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">Evening Shift</span>
              </label>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Identity Verification</h3>
            <Input
              label="Your KYC Document ID (Aadhar/PAN/Driving License) *"
              placeholder="Enter your document number"
              value={kycDoc}
              onChange={(e) => setKycDoc(e.target.value)}
              required
            />
            <p className="text-xs font-medium text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
              * Important: Provide your own original KYC document number. Do not provide a document belonging to a relative.
            </p>
          </div>

          <div className="pt-6">
            <Button type="submit" fullWidth size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 py-6 text-lg rounded-2xl" disabled={!name || !address || !experience || !kycDoc || isSubmitting}>
              {isSubmitting ? 'Submitting securely...' : 'Submit for Verification'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
