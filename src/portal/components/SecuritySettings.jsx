/**
 * SecuritySettings — MFA setup/management and password change.
 * Displayed as a modal/panel from the dashboard.
 */
import React, { useState, useEffect } from 'react';
import { portalApi } from '../portalApi';
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Lock,
  X,
  Smartphone,
} from 'lucide-react';

export default function SecuritySettings({ onClose }) {
  const [tab, setTab] = useState('mfa'); // 'mfa' | 'password'
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);

  useEffect(() => {
    portalApi.mfaStatus()
      .then((data) => setMfaEnabled(data.mfaEnabled))
      .catch(() => {})
      .finally(() => setMfaLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-blue-900" />
            <h2 className="text-lg font-bold text-slate-900">Security Settings</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-1 border-b border-slate-100">
          <button
            onClick={() => setTab('mfa')}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              tab === 'mfa'
                ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Two-Factor Auth
          </button>
          <button
            onClick={() => setTab('password')}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              tab === 'password'
                ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mfaLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-blue-900" />
            </div>
          ) : tab === 'mfa' ? (
            mfaEnabled ? (
              <MfaDisableView onDisabled={() => setMfaEnabled(false)} />
            ) : (
              <MfaSetupView onEnabled={() => setMfaEnabled(true)} />
            )
          ) : (
            <PasswordChangeView />
          )}
        </div>
      </div>
    </div>
  );
}

// ── MFA Setup Flow ──────────────────────────────────────────────────────────
function MfaSetupView({ onEnabled }) {
  const [step, setStep] = useState('start'); // 'start' | 'scan' | 'verify' | 'backup' | 'done'
  const [qrData, setQrData] = useState(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await portalApi.mfaSetup();
      setQrData(data);
      setStep('scan');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await portalApi.mfaVerifySetup(code.trim());
      setBackupCodes(data.backupCodes);
      setStep('backup');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  if (step === 'start') {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
          <Smartphone size={32} className="text-blue-900" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Set Up Two-Factor Authentication</h3>
          <p className="text-sm text-slate-500 mt-1">
            Add an extra layer of security by requiring a code from Microsoft Authenticator when you sign in.
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 text-left">
          <p className="text-xs font-semibold text-slate-700 mb-2">You&apos;ll need:</p>
          <ul className="text-xs text-slate-600 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">1.</span>
              Microsoft Authenticator app on your phone
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">2.</span>
              A few minutes to complete setup
            </li>
          </ul>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />{error}
          </div>
        )}
        <button
          onClick={startSetup}
          disabled={loading}
          className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
          {loading ? 'Setting up…' : 'Begin Setup'}
        </button>
      </div>
    );
  }

  if (step === 'scan') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-base font-bold text-slate-900">Scan QR Code</h3>
          <p className="text-sm text-slate-500 mt-1">
            Open Microsoft Authenticator and scan this code
          </p>
        </div>

        {qrData && (
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <img src={qrData.qrCode} alt="QR Code for Microsoft Authenticator" className="w-48 h-48" />
            </div>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-slate-500 mb-1">Can&apos;t scan? Enter this code manually:</p>
          <code className="text-xs font-mono text-slate-900 break-all select-all bg-white px-2 py-1 rounded border border-slate-200 block">
            {qrData?.secret}
          </code>
        </div>

        <form onSubmit={verifyCode} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enter the 6-digit code from the app
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-center text-2xl tracking-[0.3em] font-mono"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />{error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying…</> : 'Verify & Enable'}
          </button>
        </form>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-3">
            <ShieldCheck size={28} className="text-green-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">MFA Enabled!</h3>
          <p className="text-sm text-slate-500 mt-1">
            Save these backup codes. Each can be used once if you lose access to your authenticator.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Backup Codes</span>
            <button
              onClick={copyBackupCodes}
              className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1 font-medium"
            >
              <Copy size={12} /> Copy all
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((bc, i) => (
              <code key={i} className="text-sm font-mono text-amber-900 bg-white/80 px-3 py-1.5 rounded-lg text-center border border-amber-100">
                {bc}
              </code>
            ))}
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-xs text-red-700 font-medium">
            Store these codes securely. They will NOT be shown again.
          </p>
        </div>

        <button
          onClick={() => { setStep('done'); onEnabled(); }}
          className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all text-sm"
        >
          I&apos;ve Saved My Codes
        </button>
      </div>
    );
  }

  // done
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
        <ShieldCheck size={32} className="text-green-600" />
      </div>
      <h3 className="text-base font-bold text-slate-900">Two-Factor Authentication Active</h3>
      <p className="text-sm text-slate-500">
        Your account is now protected with Microsoft Authenticator.
      </p>
    </div>
  );
}

// ── MFA Disable View ────────────────────────────────────────────────────────
function MfaDisableView({ onDisabled }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDisable = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await portalApi.mfaDisable(code.trim());
      setSuccess(true);
      onDisabled();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
          <ShieldOff size={32} className="text-amber-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900">MFA Disabled</h3>
        <p className="text-sm text-slate-500">
          Two-factor authentication has been removed. You can re-enable it at any time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4 border border-green-200">
        <ShieldCheck size={24} className="text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-bold text-green-900">MFA is Active</p>
          <p className="text-xs text-green-700">Your account is protected with Microsoft Authenticator.</p>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h4 className="text-sm font-bold text-slate-900 mb-2">Disable MFA</h4>
        <p className="text-xs text-slate-500 mb-3">Enter a current code from your authenticator app to disable MFA.</p>

        <form onSubmit={handleDisable} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none text-sm text-center text-xl tracking-[0.3em] font-mono"
          />
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />{error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Disabling…</> : 'Disable MFA'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Password Change View ────────────────────────────────────────────────────
function PasswordChangeView() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
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
      await portalApi.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700 animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          Password changed successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
            />
          </div>
        </div>

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
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
            />
          </div>
          <p className="text-xs text-slate-400">Min 8 characters, at least 1 letter and 1 number</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />{error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Changing…</> : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
