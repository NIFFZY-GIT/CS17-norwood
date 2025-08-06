'use client';

import { Item } from '@/lib/types';
import { DollarSign, ScanLine, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { LazyProductImage } from '../LazyProductImage';

// A small helper for consistent currency formatting
const formatCurrency = (amount: number, currency: Item['currency']) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => void;
}

export default function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const isSale = item.originalPrice && item.originalPrice > item.price;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]">
      <div className="relative w-full h-40 xs:h-48 flex-shrink-0">
        <LazyProductImage
          itemId={item._id}
          itemName={item.name}
          className="object-cover w-full h-full bg-slate-100 dark:bg-slate-700"
          width={300}
          height={192}
          priority={false}
        />
        {/* --- STOCK STATUS BADGE --- */}
        <div className="absolute top-2 left-2">
          {item.inStock ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={14} />
              In Stock
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 px-2.5 py-1 rounded-full">
              <XCircle size={14} />
              Out of Stock
            </span>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-md sm:text-lg font-semibold text-slate-800 dark:text-white mb-1 truncate" title={item.name}>
            {item.name}
          </h3>
          {item.itemCode && (
            <p className="text-xs text-sky-600 dark:text-sky-400 mb-2 flex items-center">
              <ScanLine size={14} className="mr-1.5 flex-shrink-0" />
              Code: <span className="font-medium truncate">{item.itemCode}</span>
            </p>
          )}
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 h-12 sm:h-16 overflow-y-auto custom-scrollbar">
            {item.description}
          </p>
        </div>

        {/* --- PRICE AND ACTIONS FOOTER --- */}
        <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="flex flex-col">
            {isSale && (
               <span className="text-xs text-slate-500 line-through">
                {formatCurrency(item.originalPrice!, item.currency)}
              </span>
            )}
            <span className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center">
              <DollarSign size={16} className="mr-0.5 text-slate-500" />
              {formatCurrency(item.price, item.currency)}
            </span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <button onClick={() => onEdit(item)} className="p-1.5 sm:p-2 text-slate-600 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 transition-colors" title="Edit item">
              <Pencil size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button onClick={() => onDelete(item._id)} className="p-1.5 sm:p-2 text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors" title="Delete item">
              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}