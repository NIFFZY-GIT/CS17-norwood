'use client';
// src/components/dashboard/ItemCard.tsx
import { Item } from '@/lib/types';
import NextImage from 'next/image';
import { CalendarDays, ScanLine, Pencil, Trash2 } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => void;
}

export default function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const imgSrc = item.imageBase64 || "/placeholder-image.png";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]">
      <div className="relative w-full h-40 xs:h-48 flex-shrink-0"> {/* Adjusted height for smaller screens */}
        <NextImage
          src={imgSrc}
          alt={item.name}
          fill
          style={{ objectFit: 'cover' }}
          className="bg-slate-100 dark:bg-slate-700"
          onError={(e) => {
            if (imgSrc !== "/placeholder-image.png") {
              (e.currentTarget as HTMLImageElement).src = "/placeholder-image.png";
            }
          }}
          unoptimized={imgSrc.startsWith('data:image')}
        />
      </div>
      <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-md sm:text-lg font-semibold text-slate-800 dark:text-white mb-1 truncate" title={item.name}>{item.name}</h3>
          {item.itemCode && (
            <p className="text-xs text-sky-600 dark:text-sky-400 mb-2 flex items-center">
              <ScanLine size={14} className="mr-1.5 flex-shrink-0" />
              Code: <span className="font-medium truncate">{item.itemCode}</span> {/* Added truncate for item code */}
            </p>
          )}
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 h-12 sm:h-16 overflow-y-auto custom-scrollbar"> {/* Adjusted height */}
            {item.description}
          </p>
        </div>
        <div className="mt-auto pt-2 border-t border-slate-200 dark:border-slate-700">
          {item.createdAt && (
            <div className="text-xs text-slate-500 dark:text-slate-500 flex items-center mb-2 sm:mb-3"> {/* Adjusted margin */}
              <CalendarDays size={14} className="mr-1.5" />
              Added: {new Date(item.createdAt).toLocaleDateString()}
            </div>
          )}
          <div className="flex justify-end space-x-1 sm:space-x-2"> {/* Adjusted spacing */}
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 transition-colors"
              title="Edit item"
            >
              <Pencil size={16} className="sm:w-[18px] sm:h-[18px]" /> {/* FIXED: Apply responsive size via className */}
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
              title="Delete item"
            >
              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /> {/* FIXED: Apply responsive size via className */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}