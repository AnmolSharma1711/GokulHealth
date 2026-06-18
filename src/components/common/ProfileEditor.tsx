import React, { useState } from 'react';
import { Profile } from '../../types/database';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { db } from '../../store/MockDatabase';
import { User, MapPin } from 'lucide-react';

interface Props {
  profile: Profile;
  onSave?: (updatedProfile: Profile) => void;
  isAdminEdit?: boolean;
  onCancel?: () => void;
}

export function ProfileEditor({ profile, onSave, isAdminEdit, onCancel }: Props) {
  const [name, setName] = useState(profile.name || '');
  const [address, setAddress] = useState(profile.address || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await db.updateProfile(profile.id, { name, address });
      if (onSave) {
        onSave({ ...profile, name, address });
      }
      if (!isAdminEdit) {
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card shadow-xl border-slate-200 animate-fade-in-up">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 pb-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-500" />
            {isAdminEdit ? `Edit User: ${profile.phone_number}` : 'My Profile'}
          </CardTitle>
          {isAdminEdit && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{profile.role}</span>}
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Basic Info</label>
            <Input
              label="Full Name"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Location
            </label>
            <textarea
              className="flex min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all shadow-sm"
              placeholder="Enter complete residential address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-4">
            {isAdminEdit && onCancel && (
              <Button type="button" variant="outline" className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" size="lg" className={`flex-[2] bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 rounded-xl ${!isAdminEdit ? 'w-full' : ''}`} disabled={isSaving || (!name && !address)}>
              {isSaving ? 'Saving...' : 'Save Profile Details'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
