"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModernProductCard from "@/components/ProductCard";
import { Item } from "@/lib/types";
// FIX: All these imports will now be used by the restored JSX
import { Loader2, ServerCrash, PackageSearch, Sparkles, Leaf, Flame } from "lucide-react";
import { Toaster, toast } from 'sonner';
import router from "next/router";

const ProductsPage = () => {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/items");
        if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch products');
        const data: Item[] = await res.json();
        setAllItems(Array.isArray(data) ? data.map(item => ({...item, createdAt: new Date(item.createdAt)})) : []);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("An unexpected error occurred.");
        console.error("Fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return allItems;
    return allItems.filter(item => item.category === selectedCategory);
  }, [selectedCategory, allItems]);

  const categories = useMemo(() => {
    if (allItems.length === 0) return [];
    const uniqueCategories = new Set(allItems.map(item => item.category));
    return ['All', ...Array.from(uniqueCategories)];
  }, [allItems]);

  // Update the handleAddToCart function in your Products page
// In your handleAddToCart functions in both product pages:
const handleAddToCart = async (item: Item) => {
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: item._id,
        quantity: 1,
        name: item.name,
        price: item.price,
        image: item.imageBase64,
      }),
    });

    if (res.status === 401) {
      toast.error('Please sign in to add items to your cart', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/login')
        }
      });
      return;
    }

    if (!res.ok) throw new Error('Failed to add to cart');

    toast.success(`${item.name} added to your cart!`);
  } catch (err) {
    toast.error('Failed to add item to cart');
    console.error('Add to cart error:', err);
  }
};

  const pageContainerVariants = { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.5 } } };
  const heroTextVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "circOut" } } };
  const heroFeatures = [{ icon: Flame, text: "Small-Batch" }, { icon: Leaf, text: "All-Natural" }, { icon: Sparkles, text: "Bold Flavors" }];

  return (
    <motion.section variants={pageContainerVariants} initial="initial" animate="animate" className="relative min-h-screen overflow-x-hidden bg-gray-900 text-white">
      {/* FIX: The Toaster component is now rendered, fixing the 'unused' error */}
      <Toaster position="bottom-right" richColors />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 70%, #842d0bAA 0%, #11182700 30%), radial-gradient(circle at 70% 30%, #d97706AA 0%, #11182700 25%)" }} animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }} transition={{ duration: 40, ease: "linear", repeat: Infinity, repeatType: "mirror" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        {/* --- FIX: Restored full Hero Section JSX --- */}
        <div className="text-center mb-20 md:mb-28">
          <motion.h1 variants={heroTextVariants} className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">Unleash the Flavor</span>
          </motion.h1>
          <motion.p variants={heroTextVariants} className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto mb-10">
            Bold flavors, premium ingredients, and an unforgettable crunch in every single bite.
          </motion.p>
          <motion.div className="flex flex-wrap justify-center gap-x-6 gap-y-4 md:gap-x-10 mb-12">
            {heroFeatures.map((feature, i) => (
              <motion.div key={feature.text} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 + i * 0.15, ease:"easeOut" }} className="flex items-center bg-gray-800/60 backdrop-blur-sm text-slate-200 py-2.5 px-5 rounded-full shadow-lg border border-gray-700/50">
                <feature.icon className="w-5 h-5 mr-2.5 text-amber-400" />
                <span className="text-sm md:text-base font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="mb-12">
          <motion.div variants={heroTextVariants} className="mb-8 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Our Creations</h2>
              <div className="mt-2 h-1 w-20 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto md:mx-0 rounded-full"></div>
          </motion.div>
          {!isLoading && categories.length > 1 && (
              <motion.div variants={heroTextVariants} className="flex flex-wrap justify-center md:justify-start gap-3">
                  {categories.map(category => (
                      <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 border ${selectedCategory === category ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-gray-800/60 text-slate-300 border-gray-700/80 hover:bg-gray-700/80 hover:text-white'}`}>
                          {category}
                      </button>
                  ))}
              </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? ( 
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col justify-center items-center h-80 text-slate-400">
              <Loader2 className="animate-spin text-amber-500 mb-6" size={64} />
              <p className="text-2xl tracking-wider font-medium">Tossing the Spices...</p>
              <p className="text-sm text-slate-500">Prepping the perfect batch.</p>
            </motion.div>
           ) : error ? ( 
            <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-12 px-8 bg-red-900/50 backdrop-blur-md rounded-xl max-w-lg mx-auto shadow-xl border border-red-700/50">
              <ServerCrash size={60} className="mx-auto text-red-300 mb-5" />
              <h2 className="text-2xl font-semibold text-red-200 mb-3">A Flavor Mishap!</h2>
              <p className="text-red-300/90 mb-8">{error}</p>
              <button onClick={() => window.location.reload()} className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-gray-900">Stir the Pot & Retry</button>
            </motion.div>
           ) : (
            <motion.div key={selectedCategory} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { staggerChildren: 0.05 } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12">
              {filteredItems.length > 0 ? (
                // FIX: Added the 'index' from the map function
                filteredItems.map((item, index) => (
                  // FIX: Passed the 'index' prop to the card component
                  <ModernProductCard key={item._id} item={item} index={index} onAddToCart={handleAddToCart} />
                ))
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-span-full text-center py-20 text-slate-400">
                  <PackageSearch size={80} className="mx-auto text-amber-500/50 mb-8" />
                  <h2 className="text-3xl font-semibold mb-4 text-slate-200">No Items Found</h2>
                  <p className="text-lg text-slate-500">No creations match the category “{selectedCategory}”.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default ProductsPage;