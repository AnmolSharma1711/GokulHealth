import { useState } from 'react';
import { Shield, Lock, Phone } from 'lucide-react';
import { Profile } from '../../types/database';
import { db } from '../../store/MockDatabase';
import { hashMpin } from '../../utils/crypto';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { MpinInput } from '../../components/common/MpinInput';
import { ForgotPassword } from '../../components/auth/ForgotPassword';

interface Props {
  onLogin: (user: Profile) => void;
}

export function AdminAuth({ onLogin }: Props) {
  const [phone, setPhone] = useState('');
  const [mpin, setMpin] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const hashedMpin = await hashMpin(mpin);
      let user = await db.login(phone, hashedMpin);
      if (user) {
        if (user.role === 'admin') {
          onLogin(user);
        } else {
          setError('This account is not an Admin account.');
        }
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 relative animate-fade-in-up bg-slate-50">
        {/* Dynamic Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        <ForgotPassword onBack={() => setIsForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative animate-fade-in-up bg-slate-50">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md glass-card relative z-10 border-indigo-100 shadow-2xl shadow-indigo-900/10">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-indigo-100">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
            Admin Portal
          </CardTitle>
          <p className="text-slate-500 mt-2 font-medium">Secure Access Required</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="tel"
                placeholder="Admin Phone Number"
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder-slate-400"
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

            <Button type="submit" fullWidth className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 py-6 text-lg mt-4 text-white border-0" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Login to Console'}
            </Button>
            
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
              >
                Forgot your MPIN?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
