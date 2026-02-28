/**
 * Portal Login Page — supports MFA verification and password reset flows.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePortalAuth } from './PortalContext';
import { portalApi } from './portalApi';
import { Lock, Mail, Loader2, AlertCircle, Shield, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import logo from '../assets/JMC Solutions_v2_4.png';

// ── MFA Verification Step ───────────────────────────────────────────────────
function MfaStep({ onComplete, onCancel, error: parentError }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(parentError);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await onComplete(code.trim());
    } catch (err) {
      setError(err.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
          <Shield size={28} className="text-blue-900" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Two-Factor Authentication</h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter the 6-digit code from Microsoft Authenticator
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700 animate-fade-in">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification Code</label>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
            placeholder="000000"
            className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-center text-2xl tracking-[0.3em] font-mono text-slate-900 placeholder:text-slate-400"
          />
          <p className="text-xs text-slate-400 text-center mt-1">Or enter a backup code</p>
        </div>

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/25 text-sm"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Verifying…</>
          ) : (
            'Verify'
          )}
        </button>
      </form>

      <button
        onClick={onCancel}
        className="w-full text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 transition-colors"
      >
        <ArrowLeft size={14} /> Back to login
      </button>
    </div>
  );
}

// ── Forced Password Reset Step ──────────────────────────────────────────────
function ForcedResetStep({ onComplete, onCancel }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must be at least 8 characters with at least one letter and one number.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onComplete(newPassword);
    } catch (err) {
      setError(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-3">
          <KeyRound size={28} className="text-amber-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Password Reset Required</h2>
        <p className="text-sm text-slate-500 mt-1">
          Please choose a new password to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700 animate-fade-in">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/25 text-sm"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Resetting…</>
          ) : (
            'Set New Password'
          )}
        </button>
      </form>

      <button
        onClick={onCancel}
        className="w-full text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 transition-colors"
      >
        <ArrowLeft size={14} /> Back to login
      </button>
    </div>
  );
}

// ── Forgot Password Flow ────────────────────────────────────────────────────
function ForgotPasswordStep({ onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  // If we have a token in URL, show the reset form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);

  if (resetToken) {
    const handleReset = async (e) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
      if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        setError('Password must be at least 8 characters with at least one letter and one number.');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        await portalApi.resetPassword(resetToken, newPassword);
        setResetDone(true);
      } catch (err) {
        setError(err.message || 'Reset failed.');
      } finally {
        setLoading(false);
      }
    };

    if (resetDone) {
      return (
        <div className="space-y-5 text-center">
          <div className="mx-auto w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-3">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Password Reset!</h2>
          <p className="text-sm text-slate-500">You can now sign in with your new password.</p>
          <button onClick={onBack} className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all text-sm">
            Back to Sign In
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
            <KeyRound size={28} className="text-blue-900" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Set New Password</h2>
        </div>
        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />{error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Password</label>
            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm Password</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-50 text-sm">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Resetting…</> : 'Reset Password'}
          </button>
        </form>
        <button onClick={onBack} className="w-full text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 transition-colors">
          <ArrowLeft size={14} /> Back to login
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await portalApi.requestReset(email);
      setSuccess(true);
      // In dev mode, log the token
      if (data._devToken) {
        console.log('[dev] Reset token:', data._devToken);
        console.log('[dev] Reset link:', data._devLink);
      }
    } catch (err) {
      setError(err.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-3">
          <Mail size={28} className="text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Check Your Email</h2>
        <p className="text-sm text-slate-500">
          If an account exists with that email, we&apos;ve sent password reset instructions.
        </p>
        <button onClick={onBack} className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all text-sm">
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
          <Mail size={28} className="text-blue-900" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Reset Password</h2>
        <p className="text-sm text-slate-500 mt-1">Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />{error}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-50 text-sm">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : 'Send Reset Link'}
        </button>
      </form>

      <button onClick={onBack} className="w-full text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 transition-colors">
        <ArrowLeft size={14} /> Back to login
      </button>
    </div>
  );
}

// ── Main Login Page ─────────────────────────────────────────────────────────
export default function PortalLogin() {
  const { login, mfaChallenge, completeMfa, cancelMfa, forcedReset, completeForcedReset, cancelForcedReset } = usePortalAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('login'); // 'login' | 'forgot'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result?.requiresMfa || result?.requiresPasswordReset) {
        // Context will update and we'll render the appropriate step
        return;
      }
      navigate('/portal');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaComplete = async (code) => {
    await completeMfa(code);
    navigate('/portal');
  };

  const handleForcedResetComplete = async (newPassword) => {
    await completeForcedReset(newPassword);
    navigate('/portal');
  };

  // Determine which step to show
  let content;

  if (mfaChallenge) {
    content = (
      <MfaStep onComplete={handleMfaComplete} onCancel={cancelMfa} />
    );
  } else if (forcedReset) {
    content = (
      <ForcedResetStep onComplete={handleForcedResetComplete} onCancel={cancelForcedReset} />
    );
  } else if (view === 'forgot') {
    content = (
      <ForgotPasswordStep onBack={() => setView('login')} />
    );
  } else {
    content = (
      <>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700 animate-fade-in">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/25 text-sm"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Signing in…</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-center text-xs text-slate-400">
            <button
              onClick={() => setView('forgot')}
              className="text-blue-600 font-medium hover:underline"
            >
              Forgot your password?
            </button>
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <img src={logo} alt="JMC Solutions" className="h-28 w-auto mx-auto mb-5 drop-shadow-2xl" />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Client Portal</h1>
          <p className="text-blue-200/70 mt-1.5 text-sm">Sign in to access your portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-white/20 p-8">
          {content}
        </div>

        <p className="text-center text-xs text-blue-200/40 mt-6">
          &copy; {new Date().getFullYear()} JMC Solutions Ltd.
        </p>
      </div>
    </div>
  );
}
