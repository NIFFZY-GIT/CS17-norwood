'use client';

import { useState, useEffect } from 'react';
import { Item } from '@/lib/types';
import { motion } from 'framer-motion';
import ModernProductCard from '@/components/ProductCard';

export function RecommendedSection() {
  const [recommendations, setRecommendations] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    console.log('RecommendedSection: useEffect started');
    const fetchRecommendations = async () => {
      try {
        console.log('RecommendedSection: Fetching recommendations...');
        
        // Add timeout to prevent infinite waiting
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const res = await fetch('/api/products/recommendations', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('RecommendedSection: Response status:', res.status, res.ok);
        
        if (res.ok) {
          const data = await res.json();
          console.log('RecommendedSection: Received data:', data);
          console.log('RecommendedSection: Recommendations array:', data.recommendations);
          const recs = data.recommendations || [];
          if (recs.length > 0) {
            setRecommendations(recs);
            setUsingFallback(false);
            console.log('RecommendedSection: Using personalized recommendations');
          } else {
            throw new Error('No recommendations returned');
          }
        } else {
          throw new Error(`HTTP error ${res.status}`);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log("RecommendedSection: Timeout - using fallback recommendations");
        } else {
          console.log("RecommendedSection: API failed - using fallback recommendations:", error);
        }
        
        // Fallback: fetch from main items API
        try {
          console.log('RecommendedSection: Fetching fallback recommendations from items API');
          const fallbackRes = await fetch('/api/items?limit=5');
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            const fallbackItems = Array.isArray(fallbackData) ? fallbackData.slice(0, 5) : [];
            console.log('RecommendedSection: Fallback items received:', fallbackItems.length);
            setRecommendations(fallbackItems);
            setUsingFallback(true);
          } else {
            console.error('RecommendedSection: Fallback also failed');
            setRecommendations([]);
            setUsingFallback(false);
          }
        } catch (fallbackError) {
          console.error('RecommendedSection: Fallback fetch failed:', fallbackError);
          setRecommendations([]);
          setUsingFallback(false);
        }
      } finally {
        console.log('RecommendedSection: Setting loading to false');
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  console.log('RecommendedSection: Rendering - isLoading:', isLoading, 'recommendations.length:', recommendations.length, 'usingFallback:', usingFallback);

  if (isLoading) {
    console.log('RecommendedSection: Showing loading state');
    return (
      <div className="mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="mb-8 text-center md:text-left"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">Recommended For You</h2>
          <div className="mt-2 h-1 w-20 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto md:mx-0 rounded-full"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-700/50 rounded-xl h-64 mb-4"></div>
              <div className="bg-gray-700/50 rounded h-4 mb-2"></div>
              <div className="bg-gray-700/50 rounded h-4 w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Always show the section if we have any recommendations (even fallback)
  if (recommendations.length === 0) {
    console.log('RecommendedSection: No recommendations available, returning null');
    return null;
  }

  return (
    <div className="mb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "circOut" }}
        className="mb-8 text-center md:text-left"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          {usingFallback ? "Recommended for you" : "Recommended For You"}
        </h2>
        <div className="mt-2 h-1 w-20 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto md:mx-0 rounded-full"></div>
      </motion.div>
      
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {recommendations.map((item, index) => (
          <ModernProductCard key={item._id} item={item} index={index} isRecommended={!usingFallback} />
        ))}
      </motion.div>
    </div>
  );
}