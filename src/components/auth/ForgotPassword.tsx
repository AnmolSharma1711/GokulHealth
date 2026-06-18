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

  const handleSendOtp = () => {
    // Simulate sending OTP
    setStep(3);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) return setError('Enter 6-digit OTP');
    // Simulate OTP success (any 6 digits works)
    setStep(4);
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
    <div className="animate-fade-in-up w-full">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </button>

      <Card className="w-full max-w-md glass-card relative z-10 border-slate-200 shadow-2xl shadow-slate-900/5">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <KeyRound className="w-8 h-8 text-indigo-600" />
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
            Reset MPIN
          </CardTitle>
          <p className="text-slate-500 mt-2 font-medium">
            {step === 1 && 'Enter your registered phone number'}
            {step === 2 && 'Choose recovery method'}
            {step === 3 && 'Enter the verification code'}
            {step === 4 && 'Create a new secure MPIN'}
          </p>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium text-center mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleVerifyPhone} className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-900 shadow-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
              <Button type="submit" fullWidth className="bg-indigo-600 hover:bg-indigo-700 py-4 text-white" disabled={isLoading}>
                {isLoading ? 'Checking...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <button
                onClick={() => setMethod('sms')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${method === 'sms' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200 bg-white'}`}
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Phone className={`w-5 h-5 ${method === 'sms' ? 'text-indigo-600' : 'text-slate-400'}`} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Send SMS</p>
                  <p className="text-sm text-slate-500">To your registered number</p>
                </div>
                {method === 'sms' && <CheckCircle2 className="w-5 h-5 text-indigo-600 ml-auto" />}
              </button>

              <button
                onClick={() => setMethod('email')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${method === 'email' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200 bg-white'}`}
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Mail className={`w-5 h-5 ${method === 'email' ? 'text-indigo-600' : 'text-slate-400'}`} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Send Email</p>
                  <p className="text-sm text-slate-500">To your registered email</p>
                </div>
                {method === 'email' && <CheckCircle2 className="w-5 h-5 text-indigo-600 ml-auto" />}
              </button>

              <Button onClick={handleSendOtp} fullWidth className="bg-indigo-600 hover:bg-indigo-700 py-4 mt-6 text-white">
                Send OTP
              </Button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
              <p className="text-sm text-slate-600 font-medium">
                Enter the 6-digit code sent via {method.toUpperCase()}
              </p>
              
              <div className="flex gap-2 justify-center py-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={otp[i] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val) {
                        setOtp(prev => {
                          const arr = prev.split('');
                          arr[i] = val;
                          return arr.join('').substring(0, 6);
                        });
                        const next = e.target.nextElementSibling as HTMLInputElement;
                        if (next) next.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace') {
                        setOtp(prev => {
                          const arr = prev.split('');
                          arr[i] = '';
                          return arr.join('');
                        });
                        const prev = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (prev) prev.focus();
                      }
                    }}
                  />
                ))}
              </div>

              <Button type="submit" fullWidth className="bg-indigo-600 hover:bg-indigo-700 py-4 text-white">
                Verify Code
              </Button>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={handleResetPassword} className="space-y-8 text-center">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-4 uppercase tracking-widest">Enter 4-Digit MPIN</p>
                <MpinInput value={newMpin} onChange={setNewMpin} length={4} disabled={isLoading} />
              </div>

              <Button type="submit" fullWidth className="bg-indigo-600 hover:bg-indigo-700 py-4 text-white" disabled={isLoading || newMpin.length !== 4}>
                {isLoading ? 'Saving...' : 'Set New MPIN'}
              </Button>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
