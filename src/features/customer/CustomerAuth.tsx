import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { db } from '../../store/MockDatabase';
import { Profile } from '../../types/database';

export function CustomerAuth({ onLogin }: { onLogin: (profile: Profile) => void }) {
  const [phone, setPhone] = useState('');
  const [mpin, setMpin] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (phone.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }
    if (mpin.length !== 4) {
      setError('MPIN must be 4 digits');
      return;
    }

    try {
      if (isRegistering) {
        const newProfile: Profile = {
          id: crypto.randomUUID(),
          phone_number: phone,
          mpin_hash: mpin,
          role: 'customer',
          name: null,
          address: null,
          created_at: new Date().toISOString()
        };
        await db.registerProfile(newProfile);
        onLogin(newProfile);
      } else {
        const profile = await db.login(phone, mpin);
        if (profile) {
          if (profile.role !== 'customer') {
            setError('This account is not a customer account');
            return;
          }
          onLogin(profile);
        } else {
          setError('Invalid phone number or MPIN');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary-900">
            {isRegistering ? 'Create Customer Account' : 'Customer Login'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              error={error.includes('Phone') ? error : undefined}
            />
            <Input
              label="MPIN"
              type="password"
              placeholder="4-digit MPIN"
              value={mpin}
              onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              error={error.includes('MPIN') ? error : undefined}
            />
            
            {error && !error.includes('Phone') && !error.includes('MPIN') && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button type="submit" fullWidth>
              {isRegistering ? 'Register' : 'Login'}
            </Button>
            
            <p className="text-center text-sm text-slate-500 mt-4">
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-primary-600 font-medium hover:underline"
              >
                {isRegistering ? 'Login' : 'Register'}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
