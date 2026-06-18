import React, { useState } from 'react';
import { Profile } from '../../types/database';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { db } from '../../store/MockDatabase';
import { User, MapPin, Upload } from 'lucide-react';

interface Props {
  profile: Profile;
  onSave?: (updatedProfile: Profile) => void;
  isAdminEdit?: boolean;
  onCancel?: () => void;
}

export function ProfileEditor({ profile, onSave, isAdminEdit, onCancel }: Props) {
  const [name, setName] = useState(profile.name || '');
  const [address, setAddress] = useState(profile.address || '');
  const [dob, setDob] = useState(profile.dob || '');
  const [email, setEmail] = useState(profile.email || '');
  const [gender, setGender] = useState(profile.gender || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isCustomer = profile.role === 'customer';

  const calculateAge = (dobString: string) => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      const url = await db.uploadAvatar(profile.id, file);
      setAvatarUrl(url);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await db.updateProfile(profile.id, { name, address, avatar_url: avatarUrl, dob, email, gender });
      if (onSave) {
        onSave({ ...profile, name, address, avatar_url: avatarUrl, dob, email, gender });
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
        {!isCustomer && (
          <div className="flex flex-col items-center mb-8 border-b border-slate-100 pb-8">
            <div className="relative group cursor-pointer mb-4">
              <div className={`w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center ${isUploading ? 'opacity-50' : ''}`}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-300" />
                )}
              </div>
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
              </label>
            </div>
            {isUploading && <p className="text-sm font-medium text-indigo-600 animate-pulse">Uploading...</p>}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
              <Input value={profile.phone_number} readOnly className="bg-slate-50 text-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="e.g. user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
              <Input
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Gender</label>
              <select
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Date of Birth</label>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Age</label>
              <Input
                value={calculateAge(dob) ? `${calculateAge(dob)} years` : ''}
                readOnly
                placeholder="Auto-calculated"
                className="bg-slate-50 text-slate-500"
              />
            </div>
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
