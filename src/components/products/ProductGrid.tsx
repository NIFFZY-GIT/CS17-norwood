'use client';

import { motion } from 'framer-motion';
import { Item } from '@/lib/types';
// --- THE FIX IS HERE ---
// Use an absolute path alias for robustness. This assumes your card component is at src/components/ModernProductCard.tsx
import ModernProductCard  from '@/components/ProductCard';
import { PackageSearch } from 'lucide-react';

interface ProductGridProps {
    items: Item[];
    selectedCategory: string;
}

// Ensure this is a named export
export function ProductGrid({ items, selectedCategory }: ProductGridProps) {
    if (items.length === 0) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-span-full text-center py-20 text-slate-400">
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
            {items.map((item, index) => (
                <ModernProductCard key={item._id} item={item} index={index} />
            ))}
        </motion.div>
    );
}