export interface AuthAccount {
  id: string;
  username: string;
  name: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresOn: number;
  homeAccountId: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresOn: number;
  scopes: string[];
}

export interface AuthState {
  accounts: AuthAccount[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  addAccount: () => Promise<void>;
  removeAccount: (accountId: string) => void;
  refreshToken: (accountId: string) => Promise<string>;
  getAccessToken: (accountId: string) => Promise<string>;
  reloadAccounts: () => void;
}
