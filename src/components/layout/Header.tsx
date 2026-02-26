import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginButton } from '../auth/LoginButton';

export const Header: React.FC = () => {
  const { accounts, isAuthenticated } = useAuth();

  return (
    <header className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold text-foreground">
                Family Planner
              </h1>
              <p className="text-xs text-muted-foreground">Your week at a glance</p>
            </div>
          </div>

          {/* Account Status and Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <Users size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <LoginButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
