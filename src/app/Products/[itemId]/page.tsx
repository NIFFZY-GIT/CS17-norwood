'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import NextImage from 'next/image';
import { Item } from '@/lib/types';
import { Loader2, ServerCrash, ShoppingCart, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useColor } from 'color-thief-react';
import Link from 'next/link';

// --- Reusable Sub-Components ---
const QuantitySelector = ({ quantity, setQuantity }: { quantity: number, setQuantity: (q: number) => void }) => (
    <div className="flex items-center rounded-lg bg-slate-900/50 ring-1 ring-slate-700">
      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2.5 text-slate-300 hover:bg-slate-700/50 rounded-l-md transition-colors" aria-label="Decrease quantity">-</button>
      <span className="w-12 text-center font-bold text-white tabular-nums">{quantity}</span>
      <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="px-4 py-2.5 text-slate-300 hover:bg-slate-700/50 rounded-r-md transition-colors" aria-label="Increase quantity">+</button>
    </div>
);

const formatCurrency = (amount: number, currency: Item['currency']) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

const InfoTag = ({ text, colorClass, icon }: { text: string; colorClass: string; icon?: React.ReactNode }) => (
    <motion.div variants={itemVariants} className={`flex items-center gap-2 py-1.5 px-3 rounded-full text-sm font-semibold backdrop-blur-sm ${colorClass}`}>
      {icon}
      <span>{text}</span>
    </motion.div>
);

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { ease: "easeOut", duration: 0.5 } } };


// --- Main Page Component ---
export default function ProductDetailsPage() {
  const params = useParams();
  const itemId = params.itemId as string;

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: accentColor, loading: colorLoading } = useColor(item?.imageBase64 || '', 'hex', { crossOrigin: 'anonymous', quality: 10 });

  useEffect(() => {
    if (!itemId) return;
    const fetchItem = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/items/${itemId}`);
        if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch product');
        const data: Item = await res.json();
        setItem(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  const handleAddToCart = () => {
    if (!item) return;
    toast.success(`${quantity} x ${item.name} added to cart!`);
  };
  
  // --- FIX: Conditional Renders ---
  // These blocks handle all preliminary states and fix all errors.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <Loader2 className="animate-spin text-amber-500" size={64} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-900 text-center text-red-300">
        <ServerCrash size={64} className="mb-4" />
        <h2 className="text-2xl font-bold">Error Loading Product</h2>
        <p>{error}</p>
      </div>
    );
  }

  // This check ensures 'item' is not null for the rest of the component.
  if (!item) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <p className="text-2xl text-slate-400">Product not found.</p>
      </div>
    );
  }

  // By this point, TypeScript knows 'item' is a valid 'Item' object.
  const isSale = item.originalPrice && item.originalPrice > item.price;

  return (
    <>
      <Toaster richColors position="bottom-right"/>
      <div className="min-h-screen w-full bg-slate-900 text-white overflow-hidden">
        <motion.div initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut" }} className="absolute inset-0 z-0">
            <NextImage src={item.imageBase64} alt="" fill style={{objectFit: 'cover'}} className="opacity-10 blur-3xl saturate-100" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        </motion.div>
        
        <main className="relative z-10 p-4 sm:p-8 lg:p-12">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Link href="/products" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-slate-800/50 ring-1 ring-slate-700 py-2 px-4 rounded-lg">
                    <ArrowLeft size={18} /> Back to All Products
                </Link>
            </motion.div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center mt-8">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }} className="relative aspect-square w-full max-w-lg mx-auto">
                    <motion.div className="absolute inset-0 rounded-full blur-3xl" style={{ background: accentColor, opacity: 0.3 }} animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 5, repeat: Infinity, repeatType: 'mirror' }}/>
                    <NextImage src={item.imageBase64} alt={item.name} fill style={{ objectFit: 'contain' }} className="drop-shadow-2xl" unoptimized sizes="(max-width: 1024px) 100vw, 50vw"/>
                </motion.div>

                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-6">
                    <motion.div variants={itemVariants}>
                      <span className="font-semibold text-amber-400 uppercase tracking-widest">{item.category}</span>
                      <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-50">{item.name}</h1>
                    </motion.div>

                    <motion.div variants={itemVariants} className="max-w-prose">
                      <p className="text-slate-300 leading-relaxed">{item.description}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-slate-800/50 ring-1 ring-slate-700 p-4 rounded-lg flex flex-col sm:flex-row justify-between gap-4">
                        <div className='flex flex-col'>
                            <span className='text-sm text-slate-400'>Price</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold" style={{color: accentColor || '#fbbf24'}}>{formatCurrency(item.price, item.currency)}</span>
                                {isSale && (<span className="text-md text-slate-500 line-through">{formatCurrency(item.originalPrice!, item.currency)}</span>)}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {item.inStock ? 
                                <InfoTag icon={<CheckCircle size={16}/>} text="In Stock" colorClass="bg-green-500/10 text-green-300" /> :
                                <InfoTag icon={<XCircle size={16}/>} text="Out of Stock" colorClass="bg-red-500/10 text-red-400" />
                            }
                        </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
                        <motion.button onClick={handleAddToCart} disabled={!item.inStock || colorLoading} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto flex items-center justify-center gap-2 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundImage: `linear-gradient(to right, ${accentColor}CC, ${accentColor}FF)`, color: accentColor && parseInt(accentColor.substring(1, 7), 16) > 0xffffff / 2 ? '#000' : '#fff' }}>
                            <ShoppingCart size={20}/>
                            <span>Add to Cart</span>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
        </main>
      </div>
    </>
  );
}