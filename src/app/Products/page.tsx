'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Item } from '@/lib/types';
import { Loader2, ServerCrash, Sparkles, Leaf, Flame } from 'lucide-react';
import { Toaster } from 'sonner';
import { RecommendedSection } from '@/components/products/RecommendedSection';
import { CategorySidebar } from '@/components/products/CategorySidebar';
import { ProductGrid } from '@/components/products/ProductGrid';
import NextImage from 'next/image';
import Link from 'next/link';

function HeroSection() {
  const heroTextVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'circOut' } } };
  const heroFeatures = [
    { icon: Flame, text: 'Small-Batch' },
    { icon: Leaf, text: 'All-Natural' },
    { icon: Sparkles, text: 'Bold Flavors' },
  ];
  return (
    <div className="text-center mb-20 md:mb-28">
      <motion.h1 variants={heroTextVariants} className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">Unleash the Flavor</span>
      </motion.h1>
      <motion.p variants={heroTextVariants} className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto mb-10">
        Bold flavors, premium ingredients, and an unforgettable crunch in every single bite.
      </motion.p>
      <motion.div className="flex flex-wrap justify-center gap-x-6 gap-y-4 md:gap-x-10 mb-12">
        {heroFeatures.map((feature, i) => (
          <motion.div
            key={feature.text}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 + i * 0.15, ease: 'easeOut' }}
            className="flex items-center bg-gray-800/60 backdrop-blur-sm text-slate-200 py-2.5 px-5 rounded-full shadow-lg border border-gray-700/50"
          >
            <feature.icon className="w-5 h-5 mr-2.5 text-amber-400" />
            <span className="text-sm md:text-base font-medium">{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function ProductsPage() {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/items', { headers: { Accept: 'application/json' } });
        const text = await res.text();
        console.log('Raw /api/items response:', text.substring(0, 200));
        if (!res.ok) {
          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.message || `HTTP error ${res.status}`);
          } catch (parseError) {
            throw new Error(`Non-JSON response from /api/items: ${text.substring(0, 100)}...`);
          }
        }
        const data: Item[] = JSON.parse(text);
        setAllItems(Array.isArray(data) ? data : []);

        const recommendationsRes = await fetch("/api/recommendation");
        if (!recommendationsRes.ok) {
          console.error('Failed to fetch recommendations:', await recommendationsRes.json());
          setRecommendedItems([]);
        } else {
          const recommendationsData: Item[] = await recommendationsRes.json();
          setRecommendedItems(Array.isArray(recommendationsData) ? recommendationsData : []);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        console.error('Fetch items error:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  const categories = useMemo(() => {
    if (allItems.length === 0) return [];
    const uniqueCategories = new Set(allItems.map((item) => item.category));
    return ['All', ...Array.from(uniqueCategories)];
  }, [allItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return allItems;
    return allItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, allItems]);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative min-h-screen bg-gray-900 text-white">
      <Toaster position="bottom-right" richColors />
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <HeroSection />
        <RecommendedSection />

        <div className="my-16 h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <CategorySidebar categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          <main className="flex-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Our Creations</h2>
              <div className="mt-2 h-1 w-20 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto md:mx-0 rounded-full"></div>
            </motion.div>

            {isLoading ? (
              <div className="flex justify-center items-center h-80">
                <Loader2 className="animate-spin text-amber-500" size={48} />
              </div>
            ) : error ? (
              <div className="text-center py-12 px-8 bg-red-900/50 rounded-xl">
                <ServerCrash size={60} className="mx-auto text-red-300 mb-5" />
                <p>{error}</p>
              </div>
            ) : (
              <ProductGrid 
                items={filteredItems} 
                recommendedItems={recommendedItems}
                selectedCategory={selectedCategory}
              />
            )}
          </main>
        </div>
      </div>
    </motion.section>
  );
}
