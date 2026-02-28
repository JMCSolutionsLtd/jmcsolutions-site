import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JMCWebsite from './JMCWebsite';
import PortalApp from './portal/PortalApp';

const App = () => {
  return (
    <Routes>
      <Route path="/portal/*" element={<PortalApp />} />
      <Route path="*" element={<JMCWebsite />} />
    </Routes>
  );
};

export default App;
