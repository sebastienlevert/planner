import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, CheckSquare, Moon, Settings } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  labelKey: string;
  section: 'top' | 'bottom';
}

export const Sidebar: React.FC = () => {
  const { t } = useLocale();

  const navItems: NavItem[] = [
    {
      to: '/calendar',
      icon: <Calendar size={22} />,
      labelKey: 'calendar',
      section: 'top',
    },
    {
      to: '/tasks',
      icon: <CheckSquare size={22} />,
      labelKey: 'todos',
      section: 'top',
    },
    {
      to: '/sleep',
      icon: <Moon size={22} />,
      labelKey: 'sleep',
      section: 'bottom',
    },
    {
      to: '/settings',
      icon: <Settings size={22} />,
      labelKey: 'settings',
      section: 'bottom',
    },
  ];

  const topItems = navItems.filter(item => item.section === 'top');
  const bottomItems = navItems.filter(item => item.section === 'bottom');

  return (
    <aside className="w-20 bg-card border-r border-border flex flex-col items-center py-6">
      {/* Top Navigation Items */}
      <div className="flex flex-col gap-4">
        {topItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 touch-target ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium leading-tight">{t.nav[item.labelKey as keyof typeof t.nav]}</span>
          </NavLink>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Navigation Items */}
      <div className="flex flex-col gap-4">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 touch-target ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{t.nav[item.labelKey as keyof typeof t.nav]}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};
