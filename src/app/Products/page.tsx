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

interface CollaborativeRecommendationProps {
  items: Item[];
}

function OthersAlsoLikedSection({ items }: CollaborativeRecommendationProps) {
  const [recommendedItems, setRecommendedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/recommendation', {
          headers: { Accept: 'application/json' },
        });
        const text = await res.text();
        console.log('Raw API response:', text.substring(0, 200));
        if (!res.ok) {
          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.error || `HTTP error ${res.status}`);
          } catch (parseError) {
            throw new Error(`Non-JSON response from /api/recommendations: ${text.substring(0, 100)}...`);
          }
        }
        const data: Item[] = JSON.parse(text);
        if (!Array.isArray(data)) {
          console.warn('Unexpected API response format:', data);
          setRecommendedItems(items.filter((item) => item.inStock && item.category === 'Bites').slice(0, 4));
        } else {
          setRecommendedItems(data);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        console.error('Fetch recommendations error:', err);
        setError(errorMessage);
        setRecommendedItems(items.filter((item) => item.inStock && item.category === 'Bites').slice(0, 4));
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, [items]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { ease: 'easeOut', duration: 0.5 } } };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  if (error) {
    console.log('Displaying error with fallback items:', recommendedItems.map((item) => item.name));
    // Proceed to display fallback items
  }

  if (!recommendedItems.length) {
    return (
      <div className="text-center py-12 px-8 bg-gray-800/50 rounded-xl">
        <p className="text-slate-400">No recommendations available at the moment.</p>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mt-16">
      <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-white mb-6">
        Others Also Liked
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendedItems.map((item) => (
          <Link href={`/Products/${item._id}`} key={item._id} className="block">
            <motion.div
              variants={itemVariants}
              className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="relative h-48">
                <NextImage
                  src={item.imageBase64}
                  alt={item.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform hover:scale-105"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-slate-400">{item.description}</p>
                <p className="mt-2 text-amber-400 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.price)}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export default function ProductsPage() {
  const [allItems, setAllItems] = useState<Item[]>([]);
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
        <OthersAlsoLikedSection items={allItems} />

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
              <ProductGrid items={filteredItems} selectedCategory={selectedCategory} />
            )}
          </main>
        </div>
      </div>
    </motion.section>
  );
}