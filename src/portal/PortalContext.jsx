/**
 * Portal auth context — provides login/logout and client info to the portal.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { portalApi } from './portalApi';

const PortalAuthContext = createContext(null);

export function PortalAuthProvider({ children }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const data = await portalApi.login(email, password);
    localStorage.setItem('portal_token', data.token);
    setClient(data.client);
    return data.client;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('portal_token');
    setClient(null);
  }, []);

  return (
    <PortalAuthContext.Provider value={{ client, loading, login, logout }}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error('usePortalAuth must be used within PortalAuthProvider');
  return ctx;
}
