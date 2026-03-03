/**
 * Portal auth context — provides login/logout and client info to the portal.
 * Supports MFA challenge and forced password reset flows.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { portalApi } from './portalApi';

const PortalAuthContext = createContext(null);
const PORTAL_TRUSTED_DEVICE_KEY = 'portal_mfa_device';

export function PortalAuthProvider({ children }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // MFA challenge state
  const [mfaChallenge, setMfaChallenge] = useState(null); // { mfaToken }
  // Forced password reset state
  const [forcedReset, setForcedReset] = useState(null); // { resetToken }

  // On mount, verify stored token
  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    if (!token) {
      setLoading(false);
      return;
    }
    portalApi
      .verify()
      .then((data) => setClient(data.client))
      .catch(() => {
        localStorage.removeItem('portal_token');
        setClient(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const trustedDeviceToken = localStorage.getItem(PORTAL_TRUSTED_DEVICE_KEY);
    const data = await portalApi.login(email, password, trustedDeviceToken);

    // MFA required — return challenge info
    if (data.requiresMfa) {
      setMfaChallenge({ mfaToken: data.mfaToken });
      return { requiresMfa: true };
    }

    // Forced password reset
    if (data.requiresPasswordReset) {
      setForcedReset({ resetToken: data.resetToken });
      return { requiresPasswordReset: true };
    }

    localStorage.setItem('portal_token', data.token);
    setClient(data.client);
    return data.client;
  }, []);

  const completeMfa = useCallback(async (code, rememberDevice = false) => {
    if (!mfaChallenge) throw new Error('No MFA challenge in progress.');
    const data = await portalApi.mfaVerify(mfaChallenge.mfaToken, code, rememberDevice);
    if (data.trustedDeviceToken) {
      localStorage.setItem(PORTAL_TRUSTED_DEVICE_KEY, data.trustedDeviceToken);
    }
    localStorage.setItem('portal_token', data.token);
    setClient(data.client);
    setMfaChallenge(null);
    return data;
  }, [mfaChallenge]);

  const completeForcedReset = useCallback(async (newPassword) => {
    if (!forcedReset) throw new Error('No forced reset in progress.');
    const data = await portalApi.forcedReset(forcedReset.resetToken, newPassword);
    localStorage.setItem('portal_token', data.token);
    setClient(data.client);
    setForcedReset(null);
    return data;
  }, [forcedReset]);

  const cancelMfa = useCallback(() => {
    setMfaChallenge(null);
  }, []);

  const cancelForcedReset = useCallback(() => {
    setForcedReset(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('portal_token');
    setClient(null);
    setMfaChallenge(null);
    setForcedReset(null);
  }, []);

  return (
    <PortalAuthContext.Provider
      value={{
        client,
        loading,
        login,
        logout,
        mfaChallenge,
        completeMfa,
        cancelMfa,
        forcedReset,
        completeForcedReset,
        cancelForcedReset,
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error('usePortalAuth must be used within PortalAuthProvider');
  return ctx;
}
