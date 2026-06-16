import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Profile } from '../../types/database';
import { db } from '../../store/MockDatabase';
import { hashMpin } from '../../utils/crypto';

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Shield className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Secure access required
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                Admin Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mpin" className="block text-sm font-medium text-slate-700">
                Secure MPIN
              </label>
              <div className="mt-1">
                <input
                  id="mpin"
                  name="mpin"
                  type="password"
                  required
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value)}
                  maxLength={6}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter 6-digit MPIN"
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Login to Console'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
