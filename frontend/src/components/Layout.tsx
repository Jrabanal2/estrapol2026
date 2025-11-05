import React from 'react';
import { Outlet } from 'react-router-dom';
import WhatsAppChat from './WhatsAppChat';
import LoadingBar from './LoadingBar';

const Layout: React.FC = () => {
  return (
    <div className="layout">
      {/* Loading Bar para transiciones entre páginas */}
      <LoadingBar />
      
      <main className="main-content">
        <Outlet />
      </main>
      <WhatsAppChat />
    </div>
  );
};

export default Layout;