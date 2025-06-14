// src/app/Products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, RepeatType } from "framer-motion";
import ModernProductCard from "@/components/ProductCard";
import { Item } from "@/lib/types";
import { Loader2, ServerCrash, Package, Sparkles, Leaf, Flame } from "lucide-react";

// Define a type for the star properties
interface StarProps {
  key: string;
  style: {
    width: number;
    height: number;
    left: string;
    top: string;
  };
  animate: {
    x: number;
    y: number;
    opacity: number[];
    scale: number[];
  };
  transition: {
    duration: number;
    repeat: number;
    repeatType: RepeatType;
    delay: number;
  };
}

const ProductsPage = () => {
  // --- STATE VARIABLE DEFINITIONS - THESE MUST BE HERE ---
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stars, setStars] = useState<StarProps[]>([]);
  // --- END OF STATE VARIABLE DEFINITIONS ---

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/items");
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Failed to fetch products: ${res.status}`);
        }
        const data: Item[] = await res.json();
        const formattedData = data.map(item => ({
            ...item,
            createdAt: new Date(item.createdAt)
        }));
        setItems(formattedData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred while fetching products.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();

    // Generate star properties
    const generatedStars: StarProps[] = [...Array(30)].map((_, i) => ({
      key: `star-${i}`,
      style: {
        width: Math.random() * 2 + 1,
        height: Math.random() * 2 + 1,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      },
      animate: {
        x: (Math.random() - 0.5) * 50,
        y: (Math.random() - 0.5) * 50,
        opacity: [0, 1, 0.5, 0],
        scale: [1, 1.2, 1],
      },
      transition: {
        duration: Math.random() * 10 + 10,
        repeat: Infinity,
        repeatType: "mirror",
        delay: Math.random() * 5,
      },
    }));
    setStars(generatedStars);

  }, []);

  const pageContainerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.15 } },
  };

  const heroTextVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "circOut" } },
  };

  const features = [
    { icon: Flame, text: "Small-Batch Roasted", delay: 0.8 },
    { icon: Leaf, text: "All-Natural Spices", delay: 0.95 },
    { icon: Sparkles, text: "Seriously Bold Flavors", delay: 1.1 },
    { icon: Package, text: "Freshness Sealed", delay: 1.25 },
  ];

  return (
    <motion.section
      variants={pageContainerVariants}
      initial="initial"
      animate="animate"
      className="relative min-h-screen overflow-x-hidden bg-gray-900 text-white"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute inset-0"
          style={{
            // FIXED: Replaced shorthand 'background' with 'backgroundImage'
            backgroundImage: "radial-gradient(circle at 30% 70%, #842d0bAA 0%, #11182700 30%), radial-gradient(circle at 70% 30%, #d97706AA 0%, #11182700 25%)",
            backgroundRepeat: "no-repeat",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 40,
            ease: "linear",
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
        {stars.map((star) => (
          <motion.div
            key={star.key}
            className="absolute rounded-full bg-amber-400/30"
            style={star.style}
            animate={star.animate}
            transition={star.transition}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center mb-20 md:mb-28">
          <motion.h1
            variants={heroTextVariants}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 80 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
              Unleash the Flavor
            </span>
          </motion.h1>
          <motion.p
             variants={heroTextVariants}
             transition={{ duration: 0.7, delay: 0.5 }}
            className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto mb-10"
          >
            Bold flavors, premium ingredients, and an unforgettable crunch in every single bite.
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center gap-x-6 gap-y-4 md:gap-x-10 mb-12"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay, ease:"easeOut" }}
                className="flex items-center bg-gray-800/60 backdrop-blur-sm text-slate-200 py-2.5 px-5 rounded-full shadow-lg border border-gray-700/50"
              >
                <feature.icon className="w-5 h-5 mr-2.5 text-amber-400" />
                <span className="text-sm md:text-base font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

         <motion.div
            variants={heroTextVariants}
            transition={{duration: 0.6, delay: 1.3}}
            className="mb-12 text-center md:text-left"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">Our Creations</h2>
          <div className="mt-2 h-1 w-20 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto md:mx-0 rounded-full"></div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col justify-center items-center h-80 text-slate-400"
            >
              <Loader2 className="animate-spin text-amber-500 mb-6" size={64} />
              <p className="text-2xl tracking-wider font-medium">Tossing the Spices...</p>
              <p className="text-sm text-slate-500">Prepping the perfect batch.</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-center py-12 px-8 bg-red-900/50 backdrop-blur-md rounded-xl max-w-lg mx-auto shadow-xl border border-red-700/50"
            >
              <ServerCrash size={60} className="mx-auto text-red-300 mb-5" />
              <h2 className="text-2xl font-semibold text-red-200 mb-3">A Flavor Mishap!</h2>
              <p className="text-red-300/90 mb-8">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Stir the Pot & Retry
              </button>
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center py-20 text-slate-400"
            >
              <Flame size={80} className="mx-auto text-amber-500/50 mb-8" />
              <h2 className="text-3xl font-semibold mb-4 text-slate-200">Cooking Up Something New!</h2>
              <p className="text-lg text-slate-500">Our next delicious creation is just around the corner. Check back soon!</p>
            </motion.div>
          ) : (
            <motion.div
              key="itemsGrid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12"
              variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            >
              {items.map((item, index) => (
                <ModernProductCard key={item._id} item={item} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default ProductsPage;