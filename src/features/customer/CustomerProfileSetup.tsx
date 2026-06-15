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
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl text-primary-900">Complete Your Profile</CardTitle>
        <p className="text-slate-500 mt-2">Please provide your details so we can serve you better.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Basic Information</h3>
            <Input
              label="Full Name *"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Complete Address *
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm"
                placeholder="Enter your full residential address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Medical & Device Needs</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Medical Issues / History (Optional)
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm"
                placeholder="Briefly describe any relevant medical history"
                value={medicalIssues}
                onChange={(e) => setMedicalIssues(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Device Support Requirements (Optional)
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm"
                placeholder="e.g. Needs oxygen concentrator support"
                value={deviceSupport}
                onChange={(e) => setDeviceSupport(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" fullWidth disabled={!name || !address || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Profile & Continue'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
