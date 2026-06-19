import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Phone, Mail, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { db } from '../../store/MockDatabase';
import { hashMpin } from '../../utils/crypto';
import { MpinInput } from '../common/MpinInput';

interface Props {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'sms' | 'email'>('sms');
  const [otp, setOtp] = useState('');
  const [newMpin, setNewMpin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (phone.length !== 10) return setError('Enter a valid 10-digit phone number');
    
    setIsLoading(true);
    const user = await db.searchUserByPhone(phone);
    setIsLoading(false);
    
    if (!user) return setError('No account found with this phone number');
    setStep(2);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) return setError('Enter 6-digit OTP');
    
    setIsLoading(true);
    try {
      if (method === 'sms') {
        await db.verifyPhoneOtp(phone, otp);
      } else {
        // Mock email OTP for now
        if (otp !== '123456') throw new Error('Invalid code');
      }
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = otp.split('');
    newOtp[index] = value;
    const joined = newOtp.join('');
    setOtp(joined);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newMpin.length !== 4) return setError('MPIN must be 4 digits');
    
    setIsLoading(true);
    try {
      const user = await db.searchUserByPhone(phone);
      if (user) {
        const hashed = await hashMpin(newMpin);
        await db.updateProfile(user.id, { mpin_hash: hashed });
        alert('MPIN reset successfully! You can now log in.');
        onBack();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset MPIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up w-full max-w-md mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </button>

      <Card className="glass-card dark:glass-dark border-white/50 dark:border-slate-800 shadow-xl transition-all duration-300">
        <CardHeader className="pt-8 text-center pb-2">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {step === 1 ? <Phone className="w-8 h-8 text-primary-600 dark:text-primary-400" /> :
             step === 2 ? <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" /> :
             step === 3 ? <CheckCircle2 className="w-8 h-8 text-primary-600 dark:text-primary-400" /> :
             <KeyRound className="w-8 h-8 text-primary-600 dark:text-primary-400" />}
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 dark:text-white">
            {step === 1 ? 'Reset MPIN' :
             step === 2 ? 'Choose Recovery' :
             step === 3 ? 'Verify OTP' :
             'New MPIN'}
          </CardTitle>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {step === 1 && 'Enter your registered phone number'}
            {step === 2 && 'Choose recovery method'}
            {step === 3 && 'Enter the verification code'}
            {step === 4 && 'Create a new secure MPIN'}
          </p>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          {step === 1 && (
            <form onSubmit={handleVerifyPhone} className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-slate-900 dark:text-white"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
              {error && <div className="text-red-500 dark:text-red-400 text-sm font-medium text-center">{error}</div>}
              <Button type="submit" fullWidth className="bg-primary-600 hover:bg-primary-700 py-4 text-white" disabled={isLoading}>
                {isLoading ? 'Checking...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={async () => { 
                  setMethod('sms'); 
                  setError('');
                  setIsLoading(true);
                  try {
                    await db.sendPhoneOtp(phone);
                    setStep(3); 
                  } catch(err: any) {
                    setError(err.message || 'Failed to send SMS');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900 dark:text-white">Send SMS</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">to ends in {phone.slice(-4)}</div>
                  </div>
                </div>
              </button>
              {error && <div className="text-red-500 dark:text-red-400 text-sm font-medium text-center mt-4">{error}</div>}
              <button
                type="button"
                onClick={() => { setMethod('email'); setStep(3); }}
                className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900 dark:text-white">Send Email</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">registered email</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Enter the 6-digit code sent via {method.toUpperCase()}
              </p>
              <div className="flex justify-center gap-3">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    className="w-12 h-14 text-center text-2xl font-black bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-slate-900 dark:text-white"
                    value={otp[i] || ''}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  />
                ))}
              </div>
              {error && <div className="text-red-500 dark:text-red-400 text-sm font-medium text-center">{error}</div>}
              <Button type="submit" fullWidth className="bg-primary-600 hover:bg-primary-700 py-4 text-white" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <MpinInput value={newMpin} onChange={setNewMpin} />
              {error && <div className="text-red-500 dark:text-red-400 text-sm font-medium text-center">{error}</div>}
              <Button type="submit" fullWidth className="bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/20 py-4 text-white border-0" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Set New MPIN'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
