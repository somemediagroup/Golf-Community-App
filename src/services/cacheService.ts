// Advanced caching service for performance optimization

/**
 * Constants for cache management
 */
export const CACHE_VERSION = 'v1.0.0'; // Increment for cache busting
export const CACHE_PREFIX = `golf_app_${CACHE_VERSION}_`;
export const CACHE_EXPIRATION = {
  SHORT: 5 * 60 * 1000,       // 5 minutes
  MEDIUM: 30 * 60 * 1000,     // 30 minutes
  LONG: 24 * 60 * 60 * 1000,  // 24 hours
  WEEK: 7 * 24 * 60 * 60 * 1000  // 7 days
};

/**
 * Storage types
 */
export const StorageType = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage'
};

/**
 * CacheItem interface
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache service for improving data loading performance
 */
class CacheService {
  private initialized = false;
  
  /**
   * Initialize the cache service
   */
  initialize() {
    if (this.initialized) return;
    
    // Run maintenance on startup
    this.maintenance();
    
    // Set up scheduled maintenance (once per hour)
    setInterval(() => this.maintenance(), 60 * 60 * 1000);
    
    this.initialized = true;
  }
  
  /**
   * Get data from cache
   */
  getData<T>(key: string, storageType = StorageType.LOCAL): T | null {
    try {
      const storage = storageType === StorageType.LOCAL ? localStorage : sessionStorage;
      const cachedItem = storage.getItem(`${CACHE_PREFIX}${key}`);
      
      if (!cachedItem) return null;
      
      const { data, timestamp, ttl } = JSON.parse(cachedItem) as CacheItem<T>;
      
      // Check if cache is still valid
      if (Date.now() - timestamp < ttl) {
        return data;
      }
      
      // Remove expired item
      storage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    } catch (e) {
      console.warn('Cache read error:', e);
      this.removeData(key, storageType); // Clean up potentially corrupted cache
      return null;
    }
  }
  
  /**
   * Set data in cache
   */
  setData<T>(key: string, data: T, ttl = CACHE_EXPIRATION.MEDIUM, storageType = StorageType.LOCAL): void {
    try {
      const storage = storageType === StorageType.LOCAL ? localStorage : sessionStorage;
      const cacheData: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl
      };
      
      storage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Cache write error:', e);
      
      // If we're out of storage space, clear older items
      if (e instanceof DOMException && 
          (e.name === 'QuotaExceededError' || 
           e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        this.prune(storageType);
        
        // Try again after pruning
        try {
          const storage = storageType === StorageType.LOCAL ? localStorage : sessionStorage;
          const cacheData: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            ttl
          };
          
          storage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
        } catch (e2) {
          console.warn('Cache write retry failed:', e2);
        }
      }
    }
  }
  
  /**
   * Remove a specific item from cache
   */
  removeData(key: string, storageType = StorageType.LOCAL): void {
    try {
      const storage = storageType === StorageType.LOCAL ? localStorage : sessionStorage;
      storage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (e) {
      console.warn('Cache remove error:', e);
    }
  }
  
  /**
   * Clear all cache items for current app version
   */
  clearCache(storageType = StorageType.LOCAL): void {
    try {
      const storage = storageType === StorageType.LOCAL ? localStorage : sessionStorage;
      
      Object.keys(storage)
        .filter(key => key.startsWith(CACHE_PREFIX))
        .forEach(key => storage.removeItem(key));
    } catch (e) {
      console.warn('Cache clear error:', e);
    }
  }
  
  /**
   * Prune storage when it's full (remove oldest items)
   */
  private prune(storageType = StorageType.LOCAL): void {
    try {
      const storage = storageType === StorageType.LOCAL ? localStorage : sessionStorage;
      const cacheKeys = Object.keys(storage)
        .filter(key => key.startsWith(CACHE_PREFIX));
      
      if (cacheKeys.length === 0) return;
      
      // Get items with timestamps
      const items = cacheKeys
        .map(key => {
          try {
            const item = JSON.parse(storage.getItem(key) || '{}');
            return { key, timestamp: item.timestamp || 0 };
          } catch {
            return { key, timestamp: 0 };
          }
        })
        .sort((a, b) => a.timestamp - b.timestamp); // Sort by oldest first
      
      // Remove the oldest 20% of items
      const toRemove = Math.max(1, Math.floor(items.length * 0.2));
      items.slice(0, toRemove).forEach(item => {
        storage.removeItem(item.key);
      });
    } catch (e) {
      console.warn('Cache pruning error:', e);
    }
  }
  
  /**
   * Perform cache maintenance - remove expired and excess items
   * This helps keep the cache size manageable
   */
  maintenance(): void {
    try {
      // Process both storage types
      [localStorage, sessionStorage].forEach(storage => {
        const cacheKeys = Object.keys(storage)
          .filter(key => key.startsWith(CACHE_PREFIX));
          
        // Remove expired items
        cacheKeys.forEach(key => {
          try {
            const cacheData = JSON.parse(storage.getItem(key) || '{}');
            if (cacheData.timestamp && Date.now() - cacheData.timestamp > (cacheData.ttl || CACHE_EXPIRATION.MEDIUM)) {
              storage.removeItem(key);
            }
          } catch (e) {
            // If JSON parsing fails, remove the item
            storage.removeItem(key);
          }
        });
        
        // If we have too many items, remove the oldest ones
        if (cacheKeys.length > 50) {
          const sortedKeys = cacheKeys
            .map(key => {
              try {
                const cacheData = JSON.parse(storage.getItem(key) || '{"timestamp":0}');
                return { key, timestamp: cacheData.timestamp || 0 };
              } catch (e) {
                return { key, timestamp: 0 };
              }
            })
            .sort((a, b) => a.timestamp - b.timestamp);
          
          // Keep the 30 newest items, remove the rest
          sortedKeys.slice(0, sortedKeys.length - 30)
            .forEach(item => storage.removeItem(item.key));
        }
      });
    } catch (e) {
      console.warn('Cache maintenance error:', e);
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Initialize cache service
cacheService.initialize(); 