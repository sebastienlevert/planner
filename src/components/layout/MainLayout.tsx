import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { FABMenu } from './FABMenu';
import { useWakeLock } from '../../hooks/useWakeLock';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useWakeLock(); // Enable wake lock to prevent tablet from sleeping

  const handleCreateEvent = () => {
    // Navigate to calendar if not already there
    if (location.pathname !== '/calendar') {
      navigate('/calendar');
    }
    // Dispatch custom event to notify CalendarPage
    window.dispatchEvent(new CustomEvent('create-event'));
  };

  const handleCreateTodo = () => {
    // Navigate to tasks if not already there
    if (location.pathname !== '/tasks') {
      navigate('/tasks');
    }
    // Trigger todo creation
    window.dispatchEvent(new CustomEvent('create-todo'));
  };

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

      {/* FAB Menu - hidden on settings page */}
      {location.pathname !== '/settings' && (
        <FABMenu onCreateEvent={handleCreateEvent} onCreateTodo={handleCreateTodo} />
      )}
    </div>
  );
};
