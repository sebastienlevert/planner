import React, { useState } from 'react';
import { Plus, Calendar, CheckSquare, X } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';
import { Button } from '@/components/ui/button';

interface MenuItem {
  action: string;
  icon: React.ReactNode;
  labelKey: string;
  variant?: 'default' | 'secondary';
}

interface FABMenuProps {
  onCreateEvent?: () => void;
  onCreateTodo?: () => void;
}

export const FABMenu: React.FC<FABMenuProps> = ({ onCreateEvent, onCreateTodo }) => {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      action: 'create-event',
      icon: <Calendar size={24} />,
      labelKey: 'newEvent',
      variant: 'default',
    },
    {
      action: 'create-todo',
      icon: <CheckSquare size={24} />,
      labelKey: 'newTodo',
      variant: 'secondary',
    },
  ];

  const handleAction = (action: string) => {
    if (action === 'create-event' && onCreateEvent) {
      onCreateEvent();
    } else if (action === 'create-todo' && onCreateTodo) {
      onCreateTodo();
    }
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB Menu Container */}
      <div className="fixed bottom-8 right-8 z-50">
        {/* Menu Items */}
        <div
          className={`flex flex-col-reverse gap-4 mb-4 transition-all duration-300 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {menuItems.map((item, index) => {
            return (
              <Button
                key={item.action}
                onClick={() => handleAction(item.action)}
                variant={item.variant}
                size="icon"
                className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 active:scale-95 touch-manipulation animate-slide-in`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                aria-label={t.actions[item.labelKey as keyof typeof t.actions]}
              >
                {item.icon}
              </Button>
            );
          })}
        </div>

        {/* Main FAB Button */}
        <Button
          onClick={toggleMenu}
          size="icon"
          className={`w-16 h-16 rounded-full shadow-xl transition-all duration-300 active:scale-95 touch-manipulation ${isOpen ? 'rotate-45' : ''}`}
          aria-label={isOpen ? 'Close menu' : 'Create new'}
        >
          {isOpen ? <X size={28} /> : <Plus size={32} />}
        </Button>
      </div>
    </>
  );
};
