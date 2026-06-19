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
  const [step, setStep] = useState<'phone' | 'mpin'>('phone');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (phone.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }

    setIsLoading(true);
    try {
      const existingUser = await db.searchUserByPhone(phone);
      if (isRegistering) {
        if (existingUser) {
          setError('An account with this phone number already exists.');
        } else {
          setStep('mpin');
        }
      } else {
        if (!existingUser) {
          setError('Account not found. Please create an account.');
        } else if (existingUser.role !== 'employee') {
          setError('This account is not an employee account');
        } else {
          setStep('mpin');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMpinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
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
          avatar_url: null,
          dob: null,
          email: null,
          gender: null,
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
          setError('Invalid MPIN');
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
        <ForgotPassword onBack={() => setIsForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4 relative animate-fade-in-up transition-colors duration-300">

      <Card className="w-full max-w-md glass-card dark:glass-dark relative z-10 border-emerald-100 dark:border-emerald-500/30 shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/50 transition-all duration-300">
        <CardHeader className="pt-6 pb-2 text-center">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 -rotate-3 shadow-inner dark:border dark:border-emerald-500/30">
            {isRegistering ? (
              <UserPlus className="w-8 h-8 text-emerald-600" />
            ) : (
              <Briefcase className="w-8 h-8 text-emerald-600" />
            )}
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isRegistering ? 'Join as Employee' : 'Employee Login'}
          </CardTitle>
          <p className="text-slate-500 dark:text-white mt-2 font-medium">Employee Portal</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={step === 'phone' ? handlePhoneSubmit : handleMpinSubmit} className="space-y-4">
            {step === 'phone' ? (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="w-full pl-11 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-slate-900 dark:text-white dark:placeholder-slate-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            ) : (
              <div className="text-center animate-fade-in-up">
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-200">Entering MPIN for <span className="font-bold text-slate-900 dark:text-white">{phone}</span></p>
                  <button type="button" onClick={() => { setStep('phone'); setMpin(''); setError(''); }} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Change Number</button>
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-200 uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
                  <Lock className="w-4 h-4" /> Secure MPIN
                </p>
                <MpinInput length={4} value={mpin} onChange={setMpin} disabled={isLoading} />
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg border border-red-100 dark:border-red-500/20 font-medium text-center">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 py-6 text-lg mt-4" disabled={isLoading}>
              {isLoading ? 'Processing...' : step === 'phone' ? 'Continue' : isRegistering ? 'Register Securely' : 'Login Securely'}
            </Button>
            
            <div className="text-center mt-6">
              <p className="text-slate-500 dark:text-slate-200 text-sm mb-2">
                {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                    setStep('phone');
                    setMpin('');
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-all"
                >
                  {isRegistering ? 'Login Instead' : 'Register Now'}
                </button>
              </p>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-medium transition-colors"
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
