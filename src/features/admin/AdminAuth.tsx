import { useState } from 'react';
import { Shield, Lock, Phone } from 'lucide-react';
import { Profile } from '../../types/database';
import { db } from '../../store/MockDatabase';
import { hashMpin } from '../../utils/crypto';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

interface Props {
  onLogin: (user: Profile) => void;
}

export function AdminAuth({ onLogin }: Props) {
  const [phone, setPhone] = useState('');
  const [mpin, setMpin] = useState('');
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

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative animate-fade-in-up bg-slate-900">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md glass-dark relative z-10 border-indigo-500/30 shadow-2xl shadow-indigo-900/50">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-indigo-500/30">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <CardTitle className="text-3xl font-black text-white tracking-tight">
            Admin Portal
          </CardTitle>
          <p className="text-indigo-200/60 mt-2 font-medium">Secure Access Required</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                type="tel"
                placeholder="Admin Phone Number"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-white placeholder-slate-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                type="password"
                placeholder="6-digit Secure MPIN"
                maxLength={6}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-white tracking-widest placeholder-slate-500"
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            
            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20 font-medium text-center">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 py-6 text-lg mt-4 text-white border-0" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Login to Console'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
