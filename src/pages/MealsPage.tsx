import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginButton } from '../components/auth/LoginButton';
import { FridgeInventory } from '../components/meals/FridgeInventory';
import { RecipeGenerator } from '../components/meals/RecipeGenerator';

export const MealsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <UtensilsCrossed size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Meal Planning
          </h2>
          <p className="text-gray-600 mb-6">
            Sign in to plan meals and get AI-powered recipe suggestions.
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Meal Planning</h2>
        <p className="text-gray-600">Plan your meals with AI assistance</p>
      </div>

      <div className="space-y-6">
        <FridgeInventory />
        <RecipeGenerator />
      </div>
    </div>
  );
};
