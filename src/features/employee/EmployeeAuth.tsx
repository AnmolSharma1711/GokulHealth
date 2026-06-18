import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { db } from '../../store/MockDatabase';
import { Profile } from '../../types/database';
import { hashMpin } from '../../utils/crypto';
import { Lock, Phone, UserPlus, Briefcase } from 'lucide-react';
import { MpinInput } from '../../components/common/MpinInput';
import { ForgotPassword } from '../../components/auth/ForgotPassword';

export function EmployeeAuth({ onLogin }: { onLogin: (profile: Profile) => void }) {
  const [phone, setPhone] = useState('');
  const [mpin, setMpin] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      const hashedMpin = await hashMpin(mpin);

      if (isRegistering) {
        const newProfile: Profile = {
          id: crypto.randomUUID(),
          phone_number: phone,
          mpin_hash: hashedMpin,
          role: 'employee',
          name: null,
          address: null,
          created_at: new Date().toISOString()
        };
        await db.registerProfile(newProfile);
        onLogin(newProfile);
      } else {
        const profile = await db.login(phone, hashedMpin);
        if (profile) {
          if (profile.role !== 'employee') {
            setError('This account is not an employee account');
            return;
          }
          onLogin(profile);
        } else {
          setError('Invalid phone number or MPIN');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4 relative animate-fade-in-up">
        {/* Dynamic Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        <ForgotPassword onBack={() => setIsForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4 relative animate-fade-in-up">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md glass-card relative z-10 border-emerald-100 shadow-2xl shadow-emerald-900/10">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 -rotate-3 shadow-inner">
            {isRegistering ? (
              <UserPlus className="w-8 h-8 text-emerald-600" />
            ) : (
              <Briefcase className="w-8 h-8 text-emerald-600" />
            )}
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
            {isRegistering ? 'Join as Employee' : 'Employee Login'}
          </CardTitle>
          <p className="text-slate-500 mt-2 font-medium">Employee Portal</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-slate-900"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
                <Lock className="w-4 h-4" /> Secure MPIN
              </p>
              <MpinInput length={4} value={mpin} onChange={setMpin} disabled={isLoading} />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium text-center">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 py-6 text-lg mt-4" disabled={isLoading}>
              {isLoading ? 'Processing...' : isRegistering ? 'Register Securely' : 'Login Securely'}
            </Button>
            
            <div className="text-center mt-6">
              <p className="text-slate-500 text-sm mb-2">
                {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                  }}
                  className="text-emerald-600 font-bold hover:underline transition-all"
                >
                  {isRegistering ? 'Login Instead' : 'Register Now'}
                </button>
              </p>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                >
                  Forgot your MPIN?
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
