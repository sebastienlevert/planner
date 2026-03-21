import { useState, useEffect, useCallback } from 'react';
import { fetchWeatherForecast, clearWeatherCache, type DayForecast, getWeatherInfo } from '../services/weather.service';

export function useWeather() {
  const [forecasts, setForecasts] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWeather = useCallback(() => {
    setLoading(true);
    fetchWeatherForecast()
      .then(setForecasts)
      .catch((err) => console.warn('Weather fetch failed:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadWeather();

    // Re-fetch when settings change (e.g., location updated)
    const handleSettingsUpdate = () => {
      clearWeatherCache();
      loadWeather();
    };
    window.addEventListener('settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('settings-updated', handleSettingsUpdate);
  }, [loadWeather]);

  const getWeatherForDate = (date: Date): { icon: string; label: string; high: number; low: number } | null => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const forecast = forecasts.find((f) => f.date === dateStr);
    if (!forecast) return null;
    const info = getWeatherInfo(forecast.weatherCode);
    return { ...info, high: forecast.temperatureMax, low: forecast.temperatureMin };
  };

  return { forecasts, loading, getWeatherForDate };
}
