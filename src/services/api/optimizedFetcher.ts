import { cacheService, CACHE_EXPIRATION } from '../cacheService';

interface FetchOptions extends RequestInit {
  cacheTtl?: number;
  cacheKey?: string;
  skipCache?: boolean;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  dedupe?: boolean;
}

// Keep track of in-flight requests to avoid duplicate fetches for the same URL
const pendingRequests: Map<string, Promise<any>> = new Map();

/**
 * Enhanced fetch with caching, retries, and deduplication
 */
export async function optimizedFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const {
    cacheTtl = CACHE_EXPIRATION.MEDIUM,
    cacheKey = url,
    skipCache = false,
    retries = 2,
    retryDelay = 300,
    timeout = 10000,
    dedupe = true,
    ...fetchOptions
  } = options;

  // Check if this exact request is already in flight
  const requestKey = `${url}${JSON.stringify(fetchOptions)}`;
  if (dedupe && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey) as Promise<T>;
  }

  // If using cache, try to get from cache first
  if (!skipCache) {
    const cachedData = cacheService.getData<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  // Create a fetch request with timeout
  const fetchWithTimeout = () => {
    const controller = new AbortController();
    const { signal } = controller;
    
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    return fetch(url, { 
      ...fetchOptions, 
      signal 
    })
      .then(response => {
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
      })
      .catch(error => {
        clearTimeout(timeoutId);
        throw error;
      });
  };

  // Retry logic
  const fetchWithRetry = async (): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const data = await fetchWithTimeout();
        
        // Store successful response in cache
        if (!skipCache) {
          cacheService.setData<T>(cacheKey, data, cacheTtl);
        }
        
        return data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if it was a timeout or an abort
        if (error instanceof DOMException && error.name === 'AbortError') {
          break;
        }
        
        // Wait before next retry
        if (attempt < retries) {
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );
        }
      }
    }
    
    throw lastError;
  };

  // Create the request and track it
  const request = fetchWithRetry();
  
  if (dedupe) {
    pendingRequests.set(requestKey, request);
    
    // Clean up after the request is done
    request
      .finally(() => {
        pendingRequests.delete(requestKey);
      });
  }
  
  return request;
}

/**
 * Creates a resource loader with progress tracking
 */
export function createResourceLoader<T>(
  urls: string[],
  options: FetchOptions = {}
): { 
  load: () => Promise<T[]>,
  progress: () => number 
} {
  let loaded = 0;
  const total = urls.length;
  
  return {
    load: async () => {
      // Use Promise.allSettled to continue even if some requests fail
      const results = await Promise.allSettled(
        urls.map(url => 
          optimizedFetch<T>(url, options)
            .finally(() => { loaded++; })
        )
      );
      
      // Filter for successful results only
      return results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<T>).value);
    },
    progress: () => total > 0 ? (loaded / total) : 0
  };
} 