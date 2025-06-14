'use client'; // Ensure this is a Client Component if you're using the App Router

import { useRouter } from 'next/navigation';
import { Item } from '@/lib/types';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { ScanLine, Info, ArrowRightCircle } from 'lucide-react';

interface ModernProductCardProps {
  item: Item;
  index: number;
}

const ModernProductCard = ({ item, index }: ModernProductCardProps) => {
  const router = useRouter();

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="group relative flex flex-col bg-slate-800/60 backdrop-blur-md rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-out hover:shadow-slate-600/50 hover:ring-1 hover:ring-slate-500/70"
    >
      <div className="relative w-full h-56 md:h-60 overflow-hidden">
        <NextImage
          src={item.imageBase64 || '/placeholder-image.png'}
          alt={item.name}
          fill
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-500 ease-in-out group-hover:scale-105"
          unoptimized={item.imageBase64?.startsWith('data:image')}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="p-4 md:p-5 flex flex-col flex-grow">
        <h3
          className="text-lg md:text-xl font-semibold text-slate-50 mb-1.5 truncate"
          title={item.name}
        >
          {item.name}
        </h3>

        {item.itemCode && (
          <div className="flex items-center text-xs text-slate-400 mb-3 font-mono">
            <ScanLine size={13} className="mr-1.5 text-slate-500" />
            <span>CODE: {item.itemCode}</span>
          </div>
        )}

        <p className="text-slate-300 text-sm mb-5 leading-relaxed line-clamp-3 group-hover:text-slate-200 transition-colors duration-200">
          {item.description}
        </p>

        <div className="mt-auto pt-3 border-t border-slate-700">
          <button
            className="w-full flex items-center justify-between text-sm text-slate-200 hover:text-white font-medium py-2.5 px-1 rounded-md transition-all duration-300 focus:outline-none group-hover:bg-slate-700/50 group-hover:px-3"
            onClick={() => router.push('/Contact-Us')}
            title={`View details for ${item.name}`}
          >
            <div className="flex items-center">
              <Info
                size={16}
                className="mr-2 text-slate-400 group-hover:text-slate-200 transition-colors"
              />
              <span>Contact Us for more Details</span>
            </div>
            <ArrowRightCircle
              size={18}
              className="opacity-60 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-0.5 text-slate-400 group-hover:text-white"
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ModernProductCard;
