'use client';

import { motion } from 'framer-motion';
import { Item } from '@/lib/types';
// Use an absolute path alias for robustness.
import ModernProductCard  from '@/components/ProductCard';
import { PackageSearch } from 'lucide-react';

// MERGED: The interface now includes recommendedItems for the new feature.
interface ProductGridProps {
  items: Item[];
  recommendedItems: Item[];
  selectedCategory: string;
}

// MERGED: The component logic is combined, prioritizing the new recommendation feature.
export function ProductGrid({ items, recommendedItems, selectedCategory }: ProductGridProps) {
  // Validate inputs to prevent runtime errors (a good practice from the feature branch).
  const safeItems = Array.isArray(items) ? items : [];
  const safeRecommendedItems = Array.isArray(recommendedItems) ? recommendedItems : [];

  // Determine if the "Recommended" section should be displayed.
  const showRecommendedSection = selectedCategory === 'All' && safeRecommendedItems.length > 0;

  // MERGED: The "No Items Found" state now correctly checks if there's anything to display.
  // It only shows if the main list is empty AND the special recommended list isn't being shown.
  if (safeItems.length === 0 && !showRecommendedSection) {
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
      {/* RENDER RECOMMENDED ITEMS: This section from the feature branch is included. */}
      {/* It's only displayed for the 'All' category. */}
      {showRecommendedSection && (
        <>
          <div className="col-span-full">
            {/* An optional title for the section, can be enabled if needed. */}
            {/* <h3 className="text-2xl font-bold text-white mb-4">Others Also Liked</h3> */}
          </div>
          {safeRecommendedItems.map((item, index) => {
            if (!item?._id) {
              console.warn('Recommended item missing _id:', item);
              return null;
            }
            return (
              <ModernProductCard
                key={`rec-${item._id}`} // Prefixed key to avoid potential conflicts
                item={item}
                index={index}
              />
            );
          })}
        </>
      )}

      {/* RENDER MAIN ITEMS: This renders the standard list of items. */}
      {safeItems.map((item, index) => {
        if (!item?._id) {
          console.warn('Item missing _id:', item);
          return null;
        }
        
        // Note: The original branch had an unused `isRecommended` check here, which has been removed for clarity.
        // If duplicate items are a concern, `safeItems` can be filtered to exclude items
        // already rendered in the recommended section.
        
        return (
          <ModernProductCard
            key={item._id}
            item={item}
            // The animation index is offset to ensure a continuous stagger effect.
            index={index + (showRecommendedSection ? safeRecommendedItems.length : 0)}
          />
        );
      })}
    </motion.div>
  );
}