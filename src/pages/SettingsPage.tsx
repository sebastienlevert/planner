import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, Users, Calendar as CalendarIcon, CheckSquare, Sliders } from 'lucide-react';
import { AccountManager } from '../components/auth/AccountManager';
import { useAuth } from '../contexts/AuthContext';
import { useCalendar } from '../contexts/CalendarContext';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { StorageService } from '../services/storage.service';
import { localeNames, type Locale } from '../locales';
import { themes, type ThemeName } from '../config/themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

type SettingsTab = 'accounts' | 'calendars' | 'todos' | 'general';

export const SettingsPage: React.FC = () => {
  const { reloadAccounts, accounts } = useAuth();
  const { calendars, selectedCalendars, toggleCalendar } = useCalendar();
  const { locale, setLocale, t } = useLocale();
  const { themeName, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('accounts');
  const [calendarName, setCalendarName] = useState('');
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(themeName);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');

  useEffect(() => {
    // Reload accounts when settings page mounts to pick up any new accounts from auth callback
    reloadAccounts();

    // Load settings
    const settings = StorageService.getSettings();
    setCalendarName(settings.calendarName || t.settings.appName);
    setSelectedLocale(settings.locale || 'en');
    setSelectedTheme(settings.theme || themeName);
  }, [t]);

  const handleSaveSettings = () => {
    const settings = StorageService.getSettings();
    StorageService.setSettings({ ...settings, calendarName, locale: selectedLocale, theme: selectedTheme });
    setLocale(selectedLocale);
    setTheme(selectedTheme);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);

    // Dispatch event to notify CalendarHeader of the change
    window.dispatchEvent(new CustomEvent('settings-updated'));
  };

  const handleLocaleChange = (newLocale: Locale) => {
    setSelectedLocale(newLocale);
  };

  const handleThemeChange = (newTheme: ThemeName) => {
    setSelectedTheme(newTheme);
    // Apply theme immediately for live preview
    setTheme(newTheme);
  };

  const filteredCalendars = selectedAccountFilter === 'all'
    ? calendars
    : calendars.filter(cal => cal.accountId === selectedAccountFilter);

  const tabs = [
    { id: 'accounts' as SettingsTab, label: t.tabs.accounts, icon: Users },
    { id: 'calendars' as SettingsTab, label: t.tabs.calendars, icon: CalendarIcon },
    { id: 'todos' as SettingsTab, label: t.tabs.todos, icon: CheckSquare },
    { id: 'general' as SettingsTab, label: t.tabs.general, icon: Sliders },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
              <SettingsIcon size={28} />
              {t.settings.title}
            </h2>
            <p className="text-muted-foreground">{t.settings.subtitle}</p>
          </div>
          <Button
            onClick={handleSaveSettings}
            className={`flex items-center gap-2 ${
              isSaved ? 'bg-green-600 hover:bg-green-700' : ''
            }`}
          >
            <Save size={18} />
            {isSaved ? t.actions.saved : t.actions.save}
          </Button>
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon size={18} />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t.auth.microsoftAccounts}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t.auth.microsoftAccountsHelp}
              </p>
            </div>
            <AccountManager />
          </TabsContent>

          {/* Calendars Tab */}
          <TabsContent value="calendars" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t.settings.calendarSync}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t.settings.calendarSyncHelp}
              </p>
            </div>

            {/* Account Filter */}
            {accounts.length > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <Label htmlFor="account-filter">{t.auth.filterByAccount}</Label>
                  <select
                    id="account-filter"
                    value={selectedAccountFilter}
                    onChange={(e) => setSelectedAccountFilter(e.target.value)}
                    className="w-full mt-2 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="all">{t.auth.allAccounts}</option>
                    {accounts.map((account) => (
                      <option key={account.homeAccountId} value={account.homeAccountId}>
                        {account.username}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            )}

            {/* Calendar List */}
            <Card>
              <CardContent className="pt-6">
                {filteredCalendars.length > 0 ? (
                  <div className="space-y-3">
                    {filteredCalendars.map((calendar) => {
                      const account = accounts.find(acc => acc.homeAccountId === calendar.accountId);
                      return (
                        <label
                          key={calendar.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={selectedCalendars.includes(calendar.id)}
                            onCheckedChange={() => toggleCalendar(calendar.id)}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{calendar.name}</div>
                            {account && (
                              <div className="text-xs text-muted-foreground">{account.username}</div>
                            )}
                            {calendar.owner && (
                              <div className="text-xs text-muted-foreground/80">{calendar.owner.address}</div>
                            )}
                          </div>
                          {calendar.color && (
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: calendar.color }}
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic py-4 text-center">
                    {selectedAccountFilter === 'all' ? t.settings.noCalendars : t.settings.noCalendarsForAccount}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* To Dos Tab */}
          <TabsContent value="todos" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t.todos.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t.todos.description}
              </p>
            </div>

            <Card>
              <CardContent className="py-12 text-center">
                <CheckSquare size={48} className="mx-auto text-muted mb-4" />
                <p className="text-muted-foreground text-lg font-medium mb-2">{t.todos.comingSoon}</p>
                <p className="text-sm text-muted-foreground/80">
                  {t.todos.comingSoonDescription}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6 mt-6">
            {/* App Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.applicationSettings}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="calendarName">{t.settings.calendarName}</Label>
                  <Input
                    type="text"
                    id="calendarName"
                    value={calendarName}
                    onChange={(e) => setCalendarName(e.target.value)}
                    placeholder={t.settings.calendarNamePlaceholder}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.settings.calendarNameHelp}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">{t.settings.languageLabel}</Label>
                  <select
                    id="language"
                    value={selectedLocale}
                    onChange={(e) => handleLocaleChange(e.target.value as Locale)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {Object.entries(localeNames).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.languageHelp}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t.settings.theme}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(themes).map(([key, theme]) => {
                      const isSelected = selectedTheme === key;
                      return (
                        <Button
                          key={key}
                          variant="outline"
                          onClick={() => handleThemeChange(key as ThemeName)}
                          className={`p-4 h-auto ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex-shrink-0"
                              style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                            />
                            <div className="text-left">
                              <div className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                {theme.label}
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.themeHelp}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* App Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.about}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">{t.settings.appName}</strong> - {t.settings.appDescription}
                </p>
                <p>{t.settings.version} 1.0.0</p>
                <Separator className="my-4" />
                <p className="text-xs">
                  {t.settings.aboutDescription}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
