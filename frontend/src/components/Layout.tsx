import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import LoadingBar from './LoadingBar';

const Layout: React.FC = () => {
  return (
    <div className="layout">
      {/* Loading Bar para transiciones entre páginas */}
      <LoadingBar />
      <Navbar />
      
      <main className="main-content">
        <Outlet />
      </main>
      
    </div>
  );
};

export default Layout;