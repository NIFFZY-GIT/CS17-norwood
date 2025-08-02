'use client';

import { motion } from 'framer-motion';
import { Item } from '@/lib/types';
import ModernProductCard from '@/components/ProductCard';
import { PackageSearch } from 'lucide-react';

interface ProductGridProps {
  items: Item[];
  recommendedItems: Item[];
  selectedCategory: string;
}

export function ProductGrid({ items, recommendedItems, selectedCategory }: ProductGridProps) {
  // Validate inputs to prevent errors
  const safeItems = Array.isArray(items) ? items : [];
  const safeRecommendedItems = Array.isArray(recommendedItems) ? recommendedItems : [];

  if (safeItems.length === 0 && safeRecommendedItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full text-center py-20 text-slate-400"
      >
        <PackageSearch size={80} className="mx-auto text-amber-500/50 mb-8" />
        <h2 className="text-3xl font-semibold mb-4 text-slate-200">No Items Found</h2>
        <p className="text-lg text-slate-500">No creations match the category “{selectedCategory}”.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={selectedCategory} // Re-triggers animation when category changes
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { staggerChildren: 0.05 } }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12"
    >
      {/* Show "Others Also Liked" only when selectedCategory is 'All' */}
      {selectedCategory === 'All' && safeRecommendedItems.length > 0 && (
        <>
          <div className="col-span-full">
            {/* <h3 className="text-2xl font-bold text-white mb-4">Others Also Liked</h3> */}
          </div>
          {safeRecommendedItems.map((item, index) => {
            if (!item?._id) {
              console.warn('Recommended item missing _id:', item);
              return null;
            }
            return (
              <ModernProductCard
                key={item._id}
                item={item}
                index={index}
              />
            );
          })}
        </>
      )}
      {safeItems.map((item, index) => {
        if (!item?._id) {
          console.warn('Item missing _id:', item);
          return null;
        }
        // Check if the item is in recommendedItems to apply highlight
        const isRecommended = safeRecommendedItems.some((recItem) => {
          if (!recItem?._id) return false;
          return recItem._id.toString() === item._id.toString();
        });
        return (
          <ModernProductCard
            key={item._id}
            item={item}
            index={index + (selectedCategory === 'All' ? safeRecommendedItems.length : 0)}
            isRecommended={isRecommended}
            isFirstRowRecommended={false}
            isFirstRow={index < 3} // Only first 3 items get purple styling
          />
        );
      })}
    </motion.div>
  );
}
