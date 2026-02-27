import React, { useState, useMemo } from 'react';
import { Plus, Trash2, RefrigeratorIcon } from 'lucide-react';
import { useMeal } from '../../contexts/MealContext';
import { useLocale } from '../../contexts/LocaleContext';
import type { FridgeCategory } from '../../types/meal.types';

const categoryColors: Record<FridgeCategory, string> = {
  produce: 'bg-green-100 text-green-800',
  dairy: 'bg-blue-100 text-blue-800',
  meat: 'bg-red-100 text-red-800',
  seafood: 'bg-cyan-100 text-cyan-800',
  pantry: 'bg-yellow-100 text-yellow-800',
  condiments: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

export const FridgeInventory: React.FC = () => {
  const { fridgeItems, addFridgeItem, removeFridgeItem } = useMeal();
  const { t } = useLocale();
  const [isAdding, setIsAdding] = useState(false);

  const categories: { value: FridgeCategory; label: string }[] = useMemo(() => [
    { value: 'produce', label: t.meals.categories.produce },
    { value: 'dairy', label: t.meals.categories.dairy },
    { value: 'meat', label: t.meals.categories.meat },
    { value: 'seafood', label: t.meals.categories.seafood },
    { value: 'pantry', label: t.meals.categories.pantry },
    { value: 'condiments', label: t.meals.categories.condiments },
    { value: 'other', label: t.meals.categories.other },
  ], [t]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'produce' as FridgeCategory,
    quantity: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    addFridgeItem(newItem);
    setNewItem({ name: '', category: 'produce', quantity: '' });
    setIsAdding(false);
  };

  const groupedItems = fridgeItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<FridgeCategory, typeof fridgeItems>);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <RefrigeratorIcon size={24} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t.meals.fridgeInventory}</h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          {t.meals.addItem}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newItem.name}
              onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder={t.meals.itemName}
              autoFocus
            />
            <select
              value={newItem.category}
              onChange={e =>
                setNewItem(prev => ({ ...prev, category: e.target.value as FridgeCategory }))
              }
              className="input"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newItem.quantity}
              onChange={e => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
              className="input"
              placeholder={t.meals.quantity}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" className="btn-primary flex-1">
              {t.actions.add}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewItem({ name: '', category: 'produce', quantity: '' });
              }}
              className="btn-secondary flex-1"
            >
              {t.actions.cancel}
            </button>
          </div>
        </form>
      )}

      {fridgeItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <RefrigeratorIcon size={48} className="mx-auto mb-3 text-gray-400" />
          <p>{t.meals.emptyFridge}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => {
            const items = groupedItems[cat.value] || [];
            if (items.length === 0) return null;

            return (
              <div key={cat.value}>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">{cat.label}</h4>
                <div className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[item.category]}`}>
                          {cat.label}
                        </span>
                        <span className="font-medium">{item.name}</span>
                        {item.quantity && (
                          <span className="text-sm text-gray-500">({item.quantity})</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFridgeItem(item.id)}
                        className="btn-icon text-red-600 hover:bg-red-50"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
