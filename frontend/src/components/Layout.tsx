import React from 'react';
import { Outlet } from 'react-router-dom';
import WhatsAppChat from './WhatsAppChat';

const Layout: React.FC = () => {
  return (
    <div className="layout">
      <main className="main-content">
        <Outlet />
      </main>
      <WhatsAppChat />
    </div>
  );
};

export default Layout;