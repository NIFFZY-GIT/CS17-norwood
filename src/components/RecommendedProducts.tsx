'use client';

import { useState, useEffect } from 'react';
import { Item } from '@/lib/types';
import { motion } from 'framer-motion';
import ModernProductCard from '@/components/ProductCard';

export function RecommendedSection() {
  const [recommendations, setRecommendations] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch('/api/products/recommendations');
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.recommendations || []);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (isLoading || recommendations.length === 0) {
    return null; // Render nothing if loading or no recommendations
  }

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
      
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {recommendations.map((item, index) => (
          <ModernProductCard key={item._id} item={item} index={index} />
        ))}
      </motion.div>
    </div>
  );
}