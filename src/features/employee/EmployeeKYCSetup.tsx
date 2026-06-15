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
    <Card className="w-full max-w-2xl mx-auto mt-8 border-emerald-200">
      <CardHeader>
        <CardTitle className="text-2xl text-emerald-900">KYC & Onboarding</CardTitle>
        <p className="text-slate-500 mt-2">Submit your details to get verified and start receiving jobs.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Complete Address *
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-sm"
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

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b border-emerald-100 pb-2">Shift Preferences</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="shift"
                  value="morning"
                  checked={shiftPref === 'morning'}
                  onChange={() => setShiftPref('morning')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-700">Morning Shift</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="shift"
                  value="evening"
                  checked={shiftPref === 'evening'}
                  onChange={() => setShiftPref('evening')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-700">Evening Shift</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b border-emerald-100 pb-2">Identity Verification</h3>
            <Input
              label="KYC Document ID (Aadhar/PAN/Driving License) *"
              placeholder="Enter document number"
              value={kycDoc}
              onChange={(e) => setKycDoc(e.target.value)}
              required
            />
            <p className="text-xs text-slate-500">
              * Note: In a real app, this would be a secure document upload component.
            </p>
          </div>

          <div className="pt-4">
            <Button type="submit" fullWidth className="bg-emerald-600 hover:bg-emerald-700" disabled={!name || !address || !experience || !kycDoc || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
