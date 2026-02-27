import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useWakeLock } from '../../hooks/useWakeLock';

export const MainLayout: React.FC = () => {
  useWakeLock(); // Enable wake lock to prevent tablet from sleeping

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Page Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
