import React from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale } from '../../contexts/LocaleContext';
import { Button } from '@/components/ui/button';

export const LoginButton: React.FC = () => {
  const { addAccount, isLoading } = useAuth();
  const { t } = useLocale();

  const handleLogin = async () => {
    try {
      await addAccount();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <UserPlus size={20} />
      {isLoading ? t.actions.signingIn : t.auth.addAccount}
    </Button>
  );
};
