import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
      console.log('AuthContext: initializeAuth starting...');
      console.log('AuthContext: Current URL:', window.location.href);
      console.log('AuthContext: URL contains #:', window.location.hash);

      setIsLoading(true);
      await authService.initialize();

      console.log('AuthContext: Auth service initialized');

      // CRITICAL: Handle redirect callback IMMEDIATELY after MSAL initializes
      // This must happen before anything else, or MSAL will consume the hash fragment
      const isCallbackRoute = window.location.pathname === '/auth/callback';
      console.log('AuthContext: Is callback route?', isCallbackRoute);

      if (isCallbackRoute) {
        console.log('AuthContext: On callback route - handling redirect...');

        try {
          const response = await authService.handleRedirectCallback();
          console.log('AuthContext: handleRedirectCallback() returned:', response);

          if (response && response.account) {
            console.log('AuthContext: Authentication successful!', response.account.username);

            // Create and save the account
            const newAccount: AuthAccount = {
              id: response.account.homeAccountId,
              username: response.account.username,
              name: response.account.name || response.account.username,
              email: response.account.username,
              accessToken: response.accessToken,
              refreshToken: '',
              expiresOn: response.expiresOn?.getTime() || Date.now() + 3600000,
              homeAccountId: response.account.homeAccountId,
            };

            console.log('AuthContext: Saving account to localStorage...', newAccount.email);
            authService.saveAccount(newAccount);

            // Load the newly saved account
            const updatedAccounts = authService.loadAccounts();
            console.log('AuthContext: Loaded updated accounts:', updatedAccounts.length);
            setAccounts(updatedAccounts);
          } else {
            console.log('AuthContext: No response from handleRedirectCallback');

            // Fallback: Check if MSAL has accounts in cache
            const msalAccounts = authService.getAllAccounts();
            console.log('AuthContext: MSAL accounts in cache:', msalAccounts.length);

            if (msalAccounts.length > 0) {
              const existingStoredAccounts = authService.loadAccounts();
              const newMsalAccount = msalAccounts.find(
                msal => !existingStoredAccounts.some(stored => stored.homeAccountId === msal.homeAccountId)
              );

              if (newMsalAccount) {
                console.log('AuthContext: Found new MSAL account, getting token...');
                try {
                  const token = await authService.acquireTokenSilent(newMsalAccount);
                  const newAccount: AuthAccount = {
                    id: newMsalAccount.homeAccountId,
                    username: newMsalAccount.username,
                    name: newMsalAccount.name || newMsalAccount.username,
                    email: newMsalAccount.username,
                    accessToken: token,
                    refreshToken: '',
                    expiresOn: Date.now() + 3600000,
                    homeAccountId: newMsalAccount.homeAccountId,
                  };
                  console.log('AuthContext: Saving recovered account...', newAccount.email);
                  authService.saveAccount(newAccount);
                  const updatedAccounts = authService.loadAccounts();
                  setAccounts(updatedAccounts);
                } catch (tokenError) {
                  console.error('AuthContext: Failed to get token:', tokenError);
                }
              }
            }
          }
        } catch (callbackError) {
          console.error('AuthContext: Error handling redirect:', callbackError);
        }
      } else {
        console.log('AuthContext: Not on callback route');
      }

      // Load accounts from storage for all routes
      const storedAccounts = authService.loadAccounts();
      console.log('AuthContext: Loading accounts from storage:', storedAccounts.length);
      setAccounts(storedAccounts);

      // Validate stored accounts with MSAL
      const msalAccounts = authService.getAllAccounts();
      console.log('AuthContext: MSAL accounts in cache:', msalAccounts.length);

      const validAccounts = storedAccounts.filter((stored) =>
        msalAccounts.some((msal) => msal.homeAccountId === stored.homeAccountId)
      );

      if (validAccounts.length !== storedAccounts.length) {
        console.log('AuthContext: Removing invalid accounts');
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
      // Initiate redirect to Microsoft login
      // User will be redirected away and then back to the app
      // The account will be added in initializeAuth after redirect
      await authService.loginRedirect();
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
