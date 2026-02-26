import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { AuthAccount, AuthContextType } from '../types/auth.types';
import { StorageService } from '../services/storage.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accounts, setAccounts] = useState<AuthAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      await authService.initialize();

      // Load accounts from storage
      const storedAccounts = authService.loadAccounts();
      setAccounts(storedAccounts);

      // Validate stored accounts with MSAL
      const msalAccounts = authService.getAllAccounts();

      const validAccounts = storedAccounts.filter((stored) =>
        msalAccounts.some((msal) => msal.homeAccountId === stored.homeAccountId)
      );

      if (validAccounts.length !== storedAccounts.length) {
        setAccounts(validAccounts);
        StorageService.setAuthAccounts(validAccounts);
      }

    } catch (err) {
      console.error('Auth initialization failed:', err);
      setError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const addAccount = async () => {
    try {
      setError(null);
      const newAccount = await authService.loginPopup();
      authService.saveAccount(newAccount);
      const updatedAccounts = authService.loadAccounts();
      setAccounts(updatedAccounts);
    } catch (err) {
      console.error('Failed to add account:', err);
      setError('Failed to sign in. Please try again.');
      throw err;
    }
  };

  const removeAccount = async (accountId: string) => {
    try {
      setIsLoading(true);
      await authService.logout(accountId);

      const updatedAccounts = accounts.filter((acc) => acc.homeAccountId !== accountId);
      setAccounts(updatedAccounts);
    } catch (err) {
      console.error('Failed to remove account:', err);
      setError('Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (accountId: string): Promise<string> => {
    const msalAccount = authService.getAccountById(accountId);
    if (!msalAccount) {
      throw new Error('Account not found');
    }

    try {
      const newToken = await authService.acquireTokenSilent(msalAccount);

      // Update stored account with new token
      const updatedAccounts = accounts.map((acc) => {
        if (acc.homeAccountId === accountId) {
          return {
            ...acc,
            accessToken: newToken,
            expiresOn: Date.now() + 3600000, // 1 hour
          };
        }
        return acc;
      });

      setAccounts(updatedAccounts);
      StorageService.setAuthAccounts(updatedAccounts);

      return newToken;
    } catch (err) {
      console.error('Failed to refresh token:', err);
      throw new Error('Failed to refresh authentication token');
    }
  };

  const getAccessToken = async (accountId: string): Promise<string> => {
    const account = accounts.find((acc) => acc.homeAccountId === accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const expiresIn = account.expiresOn - Date.now();
    if (expiresIn < 300000) {
      // 5 minutes
      return refreshToken(accountId);
    }

    return account.accessToken;
  };

  const reloadAccounts = () => {
    console.log('AuthContext: Reloading accounts from storage...');
    const storedAccounts = authService.loadAccounts();
    console.log('AuthContext: Loaded accounts:', storedAccounts);
    setAccounts(storedAccounts);
  };

  const value: AuthContextType = {
    accounts,
    isAuthenticated: accounts.length > 0,
    isLoading,
    error,
    addAccount,
    removeAccount,
    refreshToken,
    getAccessToken,
    reloadAccounts,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
