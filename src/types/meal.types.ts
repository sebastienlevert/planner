export interface FridgeItem {
  id: string;
  name: string;
  category: FridgeCategory;
  quantity?: string;
  addedDate: string;
}

export type FridgeCategory = 'produce' | 'dairy' | 'meat' | 'seafood' | 'pantry' | 'condiments' | 'other';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  createdAt: string;
  isFavorite: boolean;
  source: 'ai' | 'manual';
}

export interface MealState {
  fridgeItems: FridgeItem[];
  recipes: Recipe[];
  isGenerating: boolean;
  error: string | null;
}

export interface MealContextType extends MealState {
  addFridgeItem: (item: Omit<FridgeItem, 'id' | 'addedDate'>) => void;
  removeFridgeItem: (itemId: string) => void;
  updateFridgeItem: (itemId: string, updates: Partial<FridgeItem>) => void;
  generateRecipes: (ingredients: string[]) => Promise<Recipe[]>;
  saveRecipe: (recipe: Recipe) => void;
  toggleFavorite: (recipeId: string) => void;
  deleteRecipe: (recipeId: string) => void;
  addRecipeToCalendar: (recipe: Recipe, dateTime: Date) => Promise<void>;
}
