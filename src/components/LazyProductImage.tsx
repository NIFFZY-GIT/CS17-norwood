'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (imageData || isLoading || error) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/items/${itemId}/image`);
        if (!response.ok) throw new Error('Failed to load image');
        
        const data = await response.json();
        
        if (isMounted && data.imageBase64) {
          setImageData(data.imageBase64);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Load immediately if priority, otherwise use intersection observer
    if (priority) {
      loadImage();
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadImage();
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      const element = document.getElementById(`lazy-image-${itemId}`);
      if (element) {
        observer.observe(element);
      }

      return () => {
        observer.disconnect();
        isMounted = false;
      };
    }

    return () => {
      isMounted = false;
    };
  }, [itemId, imageData, isLoading, error, priority]);

  if (error) {
    return (
      <div 
        id={`lazy-image-${itemId}`}
        className={`${className} bg-gray-700 flex items-center justify-center`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  if (isLoading || !imageData) {
    return (
      <div 
        id={`lazy-image-${itemId}`}
        className={`${className} bg-gray-700 animate-pulse flex items-center justify-center`}
        style={{ width, height }}
      >
        <div className="w-8 h-8 border-2 border-gray-500 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div id={`lazy-image-${itemId}`}>
      <Image
        src={imageData}
        alt={itemName}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    </div>
  );
}
