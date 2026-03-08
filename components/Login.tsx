
import React, { useState } from 'react';
import { authApi } from '../services/api';
import { MOCK_USERS } from '../constants';

interface LoginProps {
  onLogin: (user: { id: string; name: string; email: string; role: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      localStorage.setItem('givegoa_token', token);
      localStorage.setItem('givegoa_session', JSON.stringify(user));
      onLogin(user);
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u: { email: string; password?: string }) => {
    setEmail(u.email);
    setPassword(u.password || 'password');
    setError('');
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-rotary-blue focus:ring-4 focus:ring-blue-50/50 outline-none transition-all shadow-sm";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-rotary-blue rounded-2xl flex items-center justify-center mb-4 rotate-3 shadow-xl">
             <i className="fa-solid fa-gear text-rotary-gold text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">GiveGoa ERP</h1>
          <p className="text-slate-500 text-center mt-2">Centralized Resource Allocation for <br/>Rotary Club of Panjim</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input 
              required
              type="email" 
              className={inputClasses}
              placeholder="e.g., admin@rotarypanjim.org"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input 
              required
              type="password" 
              className={inputClasses}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-rotary-blue hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Signing in...
              </>
            ) : (
              <>
                Sign In to Dashboard
                <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Demo Accounts (password: password)</p>
          <div className="space-y-2">
            {MOCK_USERS.map(u => (
              <button 
                key={u.id}
                type="button"
                onClick={() => fillDemo({ email: u.email, password: 'password' })}
                className="w-full text-left p-2 rounded hover:bg-white border border-transparent hover:border-slate-200 flex justify-between items-center transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">{u.name}</span>
                  <span className="text-[10px] text-slate-500">{u.email}</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">{u.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
