'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Simple in-memory cache for images
const imageCache = new Map<string, string>();
// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<string>>();

// Export function to clear cache for specific item
export function clearImageCache(itemId: string) {
  imageCache.delete(itemId);
  ongoingRequests.delete(itemId);
  console.log(`LazyProductImage: Cleared cache for item ${itemId}`);
}

// Export function to clear all cache
export function clearAllImageCache() {
  imageCache.clear();
  ongoingRequests.clear();
  console.log('LazyProductImage: Cleared all image cache');
}

// Export function to force refresh an image (clear cache + trigger re-render)
export function forceRefreshImage(itemId: string) {
  clearImageCache(itemId);
  // Store timestamp in localStorage to persist across page refreshes
  const timestamp = Date.now();
  localStorage.setItem(`image_updated_${itemId}`, timestamp.toString());
  // Dispatch a custom event to notify components to refresh
  window.dispatchEvent(new CustomEvent('imageUpdated', { detail: { itemId, timestamp } }));
  console.log(`LazyProductImage: Force refresh triggered for item ${itemId} at ${timestamp}`);
}

// Clean up old timestamp entries (call this periodically)
export function cleanupImageTimestamps() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('image_updated_')) {
      const timestamp = parseInt(localStorage.getItem(key) || '0');
      if (now - timestamp > oneHour) {
        localStorage.removeItem(key);
        console.log(`LazyProductImage: Cleaned up old timestamp for ${key}`);
      }
    }
  }
}

interface LazyProductImageProps {
  itemId: string;
  itemName: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function LazyProductImage({ 
  itemId, 
  itemName, 
  className = "", 
  width = 300, 
  height = 300,
  priority = false 
}: LazyProductImageProps) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key to force re-renders

  const maxRetries = 3; // Increased from 2 to 3 retries for better reliability

  // Listen for image update events
  useEffect(() => {
    const handleImageUpdate = (event: CustomEvent) => {
      if (event.detail.itemId === itemId) {
        console.log(`LazyProductImage: Received refresh event for item ${itemId} with timestamp ${event.detail.timestamp}`);
        setImageData(null);
        setIsLoading(true);
        setError(false);
        setRetryCount(0);
        setRefreshKey(prev => prev + 1); // Force re-render
      }
    };

    window.addEventListener('imageUpdated', handleImageUpdate as EventListener);
    return () => {
      window.removeEventListener('imageUpdated', handleImageUpdate as EventListener);
    };
  }, [itemId]);

  useEffect(() => {
    // Clean up old timestamps on component mount
    cleanupImageTimestamps();
    
    // Check if image was recently updated (skip cache if so)
    const storedTimestamp = localStorage.getItem(`image_updated_${itemId}`);
    const shouldSkipCache = storedTimestamp && (Date.now() - parseInt(storedTimestamp)) < 60000; // Skip cache if updated within 1 minute
    
    // Check cache first (unless we should skip it)
    if (!shouldSkipCache) {
      const cachedImage = imageCache.get(itemId);
      if (cachedImage) {
        setImageData(cachedImage);
        setIsLoading(false);
        return;
      }
    } else {
      console.log(`LazyProductImage: Skipping cache for ${itemId} due to recent update`);
    }
    
    // Check if there's already an ongoing request for this itemId
    const ongoingRequest = ongoingRequests.get(itemId);
    if (ongoingRequest) {
      ongoingRequest
        .then((imageBase64) => {
          setImageData(imageBase64);
          setIsLoading(false);
        })
        .catch(() => {
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
          } else {
            setError(true);
            setIsLoading(false);
          }
        });
      return;
    }
    
    const loadImage = async (): Promise<string> => {
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000); // Increased to 30 second timeout to handle MongoDB Atlas latency

      try {
        // Get timestamp for cache busting - use localStorage value if available, or refreshKey
        const storedTimestamp = localStorage.getItem(`image_updated_${itemId}`);
        const cacheBuster = storedTimestamp ? `?v=${storedTimestamp}` : (refreshKey > 0 ? `?v=${refreshKey}` : '');
        
        console.log(`LazyProductImage: Fetching image for ${itemId} with cache buster: ${cacheBuster}`);
        
        const response = await fetch(`/api/items/${itemId}/image${cacheBuster}`, {
          signal: controller.signal
        });
        
        // Clear timeout on successful response
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.imageBase64) {
          // Cache the image data
          imageCache.set(itemId, data.imageBase64);
          ongoingRequests.delete(itemId); // Clean up ongoing request tracking
          console.log(`LazyProductImage: Loaded new image data for item ${itemId} (refreshKey: ${refreshKey})`);
          return data.imageBase64;
        } else {
          throw new Error('No imageBase64 in response');
        }
      } catch (err) {
        clearTimeout(timeoutId);
        ongoingRequests.delete(itemId); // Clean up ongoing request tracking
        throw err;
      }
    };

    // Create and store the promise for this request
    const requestPromise = loadImage();
    ongoingRequests.set(itemId, requestPromise);

    requestPromise
      .then((imageBase64) => {
        setImageData(imageBase64);
        setIsLoading(false);
      })
      .catch(() => {
        // Retry logic
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setError(false);
          // Delay before retry with optimized timing
          setTimeout(() => {
            // This will trigger a new useEffect cycle
          }, retryCount === 0 ? 1000 : 3000 * retryCount); // First retry after 1s, then 3s, 6s
        } else {
          setError(true);
          setIsLoading(false);
        }
      });
  }, [itemId, retryCount, maxRetries, refreshKey]);

  if (error) {
    return (
      <div 
        className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse relative overflow-hidden`}
        style={{ width, height }}
      >
        {/* Clean animated loading skeleton */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
      </div>
    );
  }

  if (isLoading || !imageData) {
    return (
      <div 
        className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse relative overflow-hidden`}
        style={{ width, height }}
      >
        {/* Clean animated loading skeleton */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
      </div>
    );
  }

  return (
    <Image
      src={imageData}
      alt={itemName}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
