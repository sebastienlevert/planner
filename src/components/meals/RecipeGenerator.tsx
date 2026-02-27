import React, { useState } from 'react';
import { Sparkles, Heart, Trash2, Clock, Users } from 'lucide-react';
import { useMeal } from '../../contexts/MealContext';
import { useLocale } from '../../contexts/LocaleContext';

export const RecipeGenerator: React.FC = () => {
  const { fridgeItems, recipes, isGenerating, error, generateRecipes, toggleFavorite, deleteRecipe } = useMeal();
  const { t } = useLocale();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const handleGenerate = async () => {
    const ingredients = fridgeItems.map(item => item.name);
    try {
      await generateRecipes(ingredients);
    } catch (err) {
      // Error is handled in context
    }
  };

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{t.meals.aiRecipeSuggestions}</h3>
            <p className="text-sm text-muted-foreground">
              {fridgeItems.length} ingredients available
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || fridgeItems.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles size={20} />
            {isGenerating ? t.actions.generating : t.meals.suggestRecipes}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {fridgeItems.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t.meals.addIngredientsFirst}
          </p>
        )}
      </div>

      {/* Recipe List */}
      {recipes.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t.meals.yourRecipes} ({recipes.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map(recipe => (
              <div
                key={recipe.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-card"
                onClick={() => setSelectedRecipeId(recipe.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{recipe.title}</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(recipe.id);
                      }}
                      className="btn-icon p-1"
                      aria-label={recipe.isFavorite ? t.actions.unfavorite : t.actions.favorite}
                    >
                      <Heart
                        size={18}
                        className={recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
                      />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(t.meals.deleteRecipeConfirm)) {
                          deleteRecipe(recipe.id);
                        }
                      }}
                      className="btn-icon p-1 text-red-600"
                      aria-label="Delete recipe"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {recipe.prepTime && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{recipe.prepTime}</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{recipe.servings}</span>
                    </div>
                  )}
                </div>

                {recipe.source === 'ai' && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      <Sparkles size={12} />
                      {t.meals.aiGenerated}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-popover rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-popover border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">{selectedRecipe.title}</h2>
              <button
                onClick={() => setSelectedRecipeId(null)}
                className="btn-secondary"
              >
                {t.actions.close}
              </button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-foreground">{selectedRecipe.description}</p>

              <div className="flex gap-6 text-sm text-muted-foreground">
                {selectedRecipe.prepTime && (
                  <div>
                    <strong>{t.meals.prep}</strong> {selectedRecipe.prepTime}
                  </div>
                )}
                {selectedRecipe.cookTime && (
                  <div>
                    <strong>{t.meals.cook}</strong> {selectedRecipe.cookTime}
                  </div>
                )}
                {selectedRecipe.servings && (
                  <div>
                    <strong>{t.meals.servings}</strong> {selectedRecipe.servings}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{t.meals.ingredients}</h3>
                <ul className="list-disc list-inside space-y-1 text-foreground">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{t.meals.instructions}</h3>
                <ol className="list-decimal list-inside space-y-2 text-foreground">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <li key={idx} className="pl-2">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
