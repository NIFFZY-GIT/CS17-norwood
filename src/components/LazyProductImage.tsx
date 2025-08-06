'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Simple in-memory cache for images
const imageCache = new Map<string, string>();
// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<string>>();

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

  const maxRetries = 3; // Increased from 2 to 3 retries for better reliability

  useEffect(() => {
    // Check cache first
    const cachedImage = imageCache.get(itemId);
    if (cachedImage) {
      setImageData(cachedImage);
      setIsLoading(false);
      return;
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
        const response = await fetch(`/api/items/${itemId}/image`, {
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
  }, [itemId, retryCount, maxRetries]);

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
