import { PublicClientApplication } from '@azure/msal-browser';
import type { AccountInfo, AuthenticationResult, SilentRequest } from '@azure/msal-browser';
import { appConfig } from '../config/app.config';
import type { AuthAccount } from '../types/auth.types';
import { StorageService } from './storage.service';

class AuthService {
  private msalInstance: PublicClientApplication | null = null;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.msalInstance = new PublicClientApplication({
        auth: {
          clientId: appConfig.microsoft.clientId,
          authority: appConfig.microsoft.authority,
          redirectUri: window.location.origin + import.meta.env.BASE_URL,
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: false,
        },
        system: {
          loggerOptions: {
            logLevel: 3, // Verbose logging for debugging
            loggerCallback: (_level: any, message: string, containsPii: boolean) => {
              if (!containsPii) {
                console.log('[MSAL]', message);
              }
            }
          }
        }
      });

      await this.msalInstance.initialize();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize MSAL:', error);
      throw new Error('Authentication initialization failed');
    }
  }

  async loginPopup(): Promise<AuthAccount> {
    if (!this.msalInstance) {
      throw new Error('Auth service not initialized');
    }

    try {
      const response: AuthenticationResult = await this.msalInstance.loginPopup({
        scopes: appConfig.microsoft.scopes,
        prompt: 'select_account',
      });

      return this.createAuthAccount(response);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Failed to sign in');
    }
  }

  async loginRedirect(): Promise<void> {
    if (!this.msalInstance) {
      throw new Error('Auth service not initialized');
    }

    try {
      await this.msalInstance.loginRedirect({
        scopes: appConfig.microsoft.scopes,
        prompt: 'select_account',
      });
    } catch (error) {
      console.error('Login redirect failed:', error);
      throw new Error('Failed to initiate sign in');
    }
  }

  async acquireTokenSilent(account: AccountInfo): Promise<string> {
    if (!this.msalInstance) {
      throw new Error('Auth service not initialized');
    }

    try {
      const request: SilentRequest = {
        scopes: appConfig.microsoft.scopes,
        account: account,
      };

      const response = await this.msalInstance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (error) {
      console.error('Silent token acquisition failed:', error);

      // Try interactive token acquisition
      try {
        const response = await this.msalInstance.acquireTokenPopup({
          scopes: appConfig.microsoft.scopes,
          account: account,
        });
        return response.accessToken;
      } catch (popupError) {
        console.error('Popup token acquisition failed:', popupError);
        throw new Error('Failed to refresh token');
      }
    }
  }

  async logout(accountId: string): Promise<void> {
    if (!this.msalInstance) {
      throw new Error('Auth service not initialized');
    }

    const accounts = this.msalInstance.getAllAccounts();
    const account = accounts.find(acc => acc.homeAccountId === accountId);

    if (account) {
      try {
        await this.msalInstance.logoutPopup({ account });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }

    // Remove from stored accounts
    const storedAccounts = StorageService.getAuthAccounts();
    const updatedAccounts = storedAccounts.filter(
      (acc: AuthAccount) => acc.homeAccountId !== accountId
    );
    StorageService.setAuthAccounts(updatedAccounts);
  }

  getAllAccounts(): AccountInfo[] {
    if (!this.msalInstance) return [];
    return this.msalInstance.getAllAccounts();
  }

  getAccountById(accountId: string): AccountInfo | null {
    const accounts = this.getAllAccounts();
    return accounts.find(acc => acc.homeAccountId === accountId) || null;
  }

  private createAuthAccount(response: AuthenticationResult): AuthAccount {
    const account = response.account;
    if (!account) {
      throw new Error('No account in authentication response');
    }

    return {
      id: account.homeAccountId,
      username: account.username,
      name: account.name || account.username,
      email: account.username,
      accessToken: response.accessToken,
      refreshToken: '', // MSAL handles refresh tokens internally
      expiresOn: response.expiresOn?.getTime() || Date.now() + 3600000,
      homeAccountId: account.homeAccountId,
    };
  }

  async handleRedirectCallback(): Promise<AuthenticationResult | null> {
    if (!this.msalInstance) {
      throw new Error('Auth service not initialized');
    }

    try {
      const response = await this.msalInstance.handleRedirectPromise();
      return response;
    } catch (error) {
      console.error('Redirect callback handling failed:', error);
      return null;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Save account to storage
  saveAccount(account: AuthAccount): void {
    const accounts: AuthAccount[] = StorageService.getAuthAccounts();
    const existingIndex = accounts.findIndex(
      (acc: AuthAccount) => acc.homeAccountId === account.homeAccountId
    );

    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }

    StorageService.setAuthAccounts(accounts);
  }

  // Load accounts from storage
  loadAccounts(): AuthAccount[] {
    return StorageService.getAuthAccounts();
  }
}

export const authService = new AuthService();
