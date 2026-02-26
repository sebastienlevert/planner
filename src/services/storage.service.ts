import { appConfig } from '../config/app.config';
import type { AppSettings } from '../types/settings.types';

export class StorageService {
  private static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  static get<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (key: ${key}):`, error);
      return false;
    }
  }

  static remove(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error);
      return false;
    }
  }

  static clear(): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // Helper methods for app-specific storage
  static getAuthAccounts() {
    return this.get(appConfig.storage.keys.auth, []);
  }

  static setAuthAccounts(accounts: any[]) {
    return this.set(appConfig.storage.keys.auth, accounts);
  }

  static getCalendarCache() {
    return this.get(appConfig.storage.keys.calendarCache, { events: [], timestamp: null });
  }

  static setCalendarCache(cache: any) {
    return this.set(appConfig.storage.keys.calendarCache, { ...cache, timestamp: Date.now() });
  }

  static getPhotoFolder() {
    return this.get(appConfig.storage.keys.photoFolder, null);
  }

  static setPhotoFolder(folderId: string) {
    return this.set(appConfig.storage.keys.photoFolder, folderId);
  }

  static getFridgeInventory() {
    return this.get(appConfig.storage.keys.fridgeInventory, []);
  }

  static setFridgeInventory(items: any[]) {
    return this.set(appConfig.storage.keys.fridgeInventory, items);
  }

  static getSavedRecipes() {
    return this.get(appConfig.storage.keys.savedRecipes, []);
  }

  static setSavedRecipes(recipes: any[]) {
    return this.set(appConfig.storage.keys.savedRecipes, recipes);
  }

  static getSettings(): AppSettings {
    return this.get<AppSettings>(appConfig.storage.keys.settings, {});
  }

  static setSettings(settings: AppSettings) {
    return this.set(appConfig.storage.keys.settings, settings);
  }
}
