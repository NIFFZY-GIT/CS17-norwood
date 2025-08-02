'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import NextImage from 'next/image';
import { ScanLine } from 'lucide-react'; // ShoppingCart icon is no longer needed
import type { Item } from '@/lib/types';

// Helper to format currency
const formatCurrency = (amount: number, currency?: string) => {
  const currencyCode = currency || 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

// The onAddToCart prop has been removed from the interface
interface ModernProductCardProps {
  item: Item;
  index: number;
  isRecommended?: boolean;
  isFirstRowRecommended?: boolean;
  isFirstRow?: boolean;
}

// The onAddToCart function has been removed from the component's parameters
const ModernProductCard = ({
  item,
  index,
  isRecommended = false,
  isFirstRowRecommended = false,
  isFirstRow = false,
}: ModernProductCardProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  } as const;

  // The handleAddToCartClick function has been removed as it's no longer used.

  const isSale = item.originalPrice && item.originalPrice > item.price;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="h-full"
    >
      <Link
        href={`/Products/${item._id}`}
        className="block h-full"
        aria-label={`View details for ${item.name || 'product'}`}
      >
        <div
          className={`group relative flex flex-col backdrop-blur-lg border rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-black/40 hover:ring-1 h-full ${
            isFirstRow 
              ? 'bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-400/60 hover:ring-purple-500/60' 
              : `bg-black/30 ${isRecommended ? 'border-amber-400 border-2' : 'border-slate-700/50'} hover:ring-amber-500/60`
          } ${
            isFirstRowRecommended ? 'bg-gradient-to-b from-amber-500/10 to-transparent' : ''
          }`}
        >
          <div className="relative w-full h-56 md:h-60 overflow-hidden after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/60 after:to-transparent after:opacity-0 group-hover:after:opacity-100 after:transition-opacity after:duration-500">
            <NextImage
              src={item.imageBase64 || '/placeholder-image.png'}
              alt={item.name || 'Product image'}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 ease-in-out group-hover:scale-105"
              unoptimized={!!item.imageBase64?.startsWith('data:image')}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute top-3 right-3">
              {!item.inStock ? (
                <span className="bg-red-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">Out of Stock</span>
              ) : isSale ? (
                <span className="bg-amber-500/90 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-md">On Sale</span>
              ) : isRecommended ? (
                <span className="bg-amber-400/90 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-md">Recommended</span>
              ) : isFirstRow ? (
                <span className="bg-purple-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">Featured</span>
              ) : null}
            </div>
          </div>

          <div className="p-4 md:p-5 flex flex-col flex-grow">
            <h3 className="text-lg md:text-xl font-semibold text-slate-100 mb-2 truncate" title={item.name || ''}>
              {item.name || 'Unnamed Product'}
            </h3>

            <p className="text-slate-300 text-sm mb-4 leading-relaxed line-clamp-2 group-hover:text-slate-200 transition-colors duration-200">
              {item.description || 'No description available.'}
            </p>

            {item.itemCode && (
              <div className="flex items-center text-xs text-slate-400 mb-4 font-mono">
                <ScanLine size={13} className="mr-1.5 text-slate-500" />
                <span>CODE: {item.itemCode}</span>
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-slate-700">
              <div className="flex flex-col text-left">
                {isSale && item.originalPrice && (
                  <span className="text-sm text-slate-500 line-through">
                    {formatCurrency(item.originalPrice, item.currency)}
                  </span>
                )}
                <span className={`text-xl font-bold ${isFirstRow ? 'text-purple-400' : 'text-amber-400'}`}>
                  {formatCurrency(item.price, item.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ModernProductCard;