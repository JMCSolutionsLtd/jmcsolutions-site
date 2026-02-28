/**
 * PortalApp — shell for the client portal, handles routing.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalAuthProvider, usePortalAuth } from './PortalContext';
import PortalLogin from './PortalLogin';
import PortalDashboard from './PortalDashboard';
import AssessmentView from './AssessmentView';
import { Loader2 } from 'lucide-react';

function RequireAuth({ children }) {
  const { client, loading } = usePortalAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-blue-900" />
      </div>
    );
  }

  if (!client) {
    return <Navigate to="/portal/login" replace />;
  }

  return children;
}

function PortalRoutes() {
  const { client, loading } = usePortalAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="login"
        element={client ? <Navigate to="/portal" replace /> : <PortalLogin />}
      />
      <Route
        index
        element={
          <RequireAuth>
            <PortalDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="assessment/:id"
        element={
          <RequireAuth>
            <AssessmentView />
          </RequireAuth>
        }
      />
      {/* Redirect /portal/assessment/new to dashboard — creation happens via API */}
      <Route path="assessment" element={<Navigate to="/portal" replace />} />
      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );
}

export default function PortalApp() {
  return (
    <PortalAuthProvider>
      <PortalRoutes />
    </PortalAuthProvider>
  );
}
