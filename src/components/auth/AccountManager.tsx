import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginButton } from './LoginButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const AccountManager: React.FC = () => {
  const { accounts, removeAccount, isLoading } = useAuth();

  const handleRemoveAccount = async (accountId: string, accountName: string) => {
    if (window.confirm(`Are you sure you want to sign out ${accountName}?`)) {
      await removeAccount(accountId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <User size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No accounts connected</p>
            <LoginButton />
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{account.name}</p>
                    <p className="text-sm text-muted-foreground">{account.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAccount(account.homeAccountId, account.name)}
                  disabled={isLoading}
                  className="text-destructive hover:bg-destructive/10"
                  aria-label={`Sign out ${account.name}`}
                >
                  <LogOut size={20} />
                </Button>
              </div>
            ))}

            <Separator className="my-4" />
            <LoginButton />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
