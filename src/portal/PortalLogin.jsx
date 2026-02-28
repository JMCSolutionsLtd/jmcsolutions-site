/**
 * Portal Login Page.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalAuth } from './PortalContext';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import logo from '../assets/JMC Solutions_v2_1.png';

export default function PortalLogin() {
  const { login } = usePortalAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/portal');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <img src={logo} alt="JMC Solutions" className="h-32 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Client Portal</h1>
          <p className="text-slate-500 mt-1">Sign in to access your portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* TODO: Implement password reset flow — structure is in place, needs email integration */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Forgot your password? Contact{' '}
            <a href="mailto:fin@jmcsolutions.ai" className="text-blue-600 hover:underline">
              fin@jmcsolutions.ai
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} JMC Solutions Ltd.
        </p>
      </div>
    </div>
  );
}
