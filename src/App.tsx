import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CalendarProvider } from './contexts/CalendarContext';
import { MealProvider } from './contexts/MealContext';
import { PhotoProvider } from './contexts/PhotoContext';
import { TaskProvider } from './contexts/TaskContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { MainLayout } from './components/layout/MainLayout';
import { CalendarPage } from './pages/CalendarPage';
import { PhotosPage } from './pages/PhotosPage';
import { MealsPage } from './pages/MealsPage';
import { TasksPage } from './pages/TasksPage';
import { SleepPage } from './pages/SleepPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  // Debug: Log all navigation
  React.useEffect(() => {
    console.log('App: Current location:', window.location.href);
    console.log('App: Hash:', window.location.hash);
    console.log('App: Search:', window.location.search);
  }, []);

  return (
    <HashRouter>
      <ThemeProvider>
        <LocaleProvider>
          <AuthProvider>
            <CalendarProvider>
              <MealProvider>
                <PhotoProvider>
                  <TaskProvider>
                    <Routes>
                      <Route path="/" element={<MainLayout />}>
                        <Route index element={<Navigate to="/calendar" replace />} />
                        <Route path="calendar" element={<CalendarPage />} />
                        <Route path="photos" element={<PhotosPage />} />
                        <Route path="meals" element={<MealsPage />} />
                        <Route path="tasks" element={<TasksPage />} />
                        <Route path="sleep" element={<SleepPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                      </Route>
                    </Routes>
                  </TaskProvider>
                </PhotoProvider>
              </MealProvider>
            </CalendarProvider>
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;
