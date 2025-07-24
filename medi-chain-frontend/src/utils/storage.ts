/**
 * Storage utility for managing localStorage with type safety and expiration support
 */

interface StorageItem<T> {
  value: T;
  expiresAt?: number; // Timestamp in milliseconds
}

/**
 * Set an item in localStorage with optional expiration
 * @param key The storage key
 * @param value The value to store (will be JSON stringified)
 * @param ttl Time to live in seconds (optional)
 */
export const setItem = <T>(key: string, value: T, ttl?: number): void => {
  try {
    const item: StorageItem<T> = {
      value,
      expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
    };
    
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error setting item in localStorage: ${error}`);
  }
};

/**
 * Get an item from localStorage
 * @param key The storage key
 * @param defaultValue The default value to return if the item doesn't exist or is expired
 * @returns The stored value or the default value
 */
export const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const itemStr = localStorage.getItem(key);
    
    if (!itemStr) {
      return defaultValue;
    }
    
    const item = JSON.parse(itemStr) as StorageItem<T>;
    
    // Check if the item has expired
    if (item.expiresAt && Date.now() > item.expiresAt) {
      // Remove the expired item
      localStorage.removeItem(key);
      return defaultValue;
    }
    
    return item.value;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${error}`);
    return defaultValue;
  }
};

/**
 * Remove an item from localStorage
 * @param key The storage key
 */
export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from localStorage: ${error}`);
  }
};

/**
 * Clear all items from localStorage
 * @param excludeKeys Array of keys to exclude from clearing
 */
export const clearAll = (excludeKeys: string[] = []): void => {
  try {
    if (excludeKeys.length === 0) {
      localStorage.clear();
      return;
    }
    
    // Store the items we want to keep
    const itemsToKeep: Record<string, string> = {};
    
    for (let i = 0; i < excludeKeys.length; i++) {
      const key = excludeKeys[i];
      const value = localStorage.getItem(key);
      if (value !== null) {
        itemsToKeep[key] = value;
      }
    }
    
    // Clear all items
    localStorage.clear();
    
    // Restore the items we want to keep
    Object.entries(itemsToKeep).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
  }
};

/**
 * Check if an item exists in localStorage and is not expired
 * @param key The storage key
 * @returns True if the item exists and is not expired
 */
export const hasItem = (key: string): boolean => {
  try {
    const itemStr = localStorage.getItem(key);
    
    if (!itemStr) {
      return false;
    }
    
    const item = JSON.parse(itemStr) as StorageItem<unknown>;
    
    // Check if the item has expired
    if (item.expiresAt && Date.now() > item.expiresAt) {
      // Remove the expired item
      localStorage.removeItem(key);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking item in localStorage: ${error}`);
    return false;
  }
};

/**
 * Get the remaining time until an item expires
 * @param key The storage key
 * @returns The remaining time in seconds, or null if the item doesn't exist or has no expiration
 */
export const getRemainingTime = (key: string): number | null => {
  try {
    const itemStr = localStorage.getItem(key);
    
    if (!itemStr) {
      return null;
    }
    
    const item = JSON.parse(itemStr) as StorageItem<unknown>;
    
    if (!item.expiresAt) {
      return null;
    }
    
    const remaining = Math.ceil((item.expiresAt - Date.now()) / 1000);
    
    // If the item has already expired, remove it and return null
    if (remaining <= 0) {
      localStorage.removeItem(key);
      return null;
    }
    
    return remaining;
  } catch (error) {
    console.error(`Error getting remaining time for item: ${error}`);
    return null;
  }
};

/**
 * Get all keys in localStorage
 * @returns An array of keys
 */
export const getKeys = (): string[] => {
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error(`Error getting localStorage keys: ${error}`);
    return [];
  }
};

/**
 * Get the size of an item in bytes
 * @param key The storage key
 * @returns The size in bytes, or 0 if the item doesn't exist
 */
export const getItemSize = (key: string): number => {
  try {
    const item = localStorage.getItem(key);
    return item ? new Blob([item]).size : 0;
  } catch (error) {
    console.error(`Error getting item size: ${error}`);
    return 0;
  }
};

/**
 * Get the total size of all items in localStorage in bytes
 * @returns The total size in bytes
 */
export const getTotalSize = (): number => {
  try {
    return getKeys().reduce((total, key) => total + getItemSize(key), 0);
  } catch (error) {
    console.error(`Error getting total localStorage size: ${error}`);
    return 0;
  }
};

/**
 * Get the remaining space in localStorage in bytes
 * @returns The remaining space in bytes, or null if it cannot be determined
 */
export const getRemainingSpace = (): number | null => {
  try {
    const testKey = 'test';
    const testValue = 'a'.repeat(1024 * 1024); // 1MB test data
    
    // Try to store a large item to determine the remaining space
    localStorage.setItem(testKey, testValue);
    
    // If we get here, the storage is not full
    localStorage.removeItem(testKey);
    
    // For a more accurate measurement, we'd need to use the StorageManager API,
    // but it's not widely supported yet
    return null;
  } catch (error) {
    // If we get an error, the storage is likely full
    return 0;
  }
};
