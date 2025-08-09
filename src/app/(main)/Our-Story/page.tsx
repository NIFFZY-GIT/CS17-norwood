// src/components/OurStory.tsx or similar
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Flame } from "lucide-react";
import Link from "next/link";

const OurStorySection = () => {
  return (
    <section className="relative py-20 md:py-28 bg-slate-950 text-white overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 0%, #d9770644 0%, #1e293b00 40%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl sm:text-6xl font-black mb-4 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
              Forged in Flavor
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            It all started with a simple craving, a hot pan, and a relentless quest for the ultimate crunch.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative group"
          >
            {/* 
              FIX APPLIED HERE:
              Replaced `aspect-w-4 aspect-h-3` with the modern, built-in Tailwind class `aspect-[4/3]`.
              This gives the div a defined size, allowing the `fill` Image to be visible.
            */}
            <div className="overflow-hidden rounded-xl shadow-2xl shadow-black/30 aspect-[4/3]">
              <Image
                src="/bite1.png" // Ensure this file exists in your `/public` folder
                alt="A delicious snack bite"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-700">
              <h3 className="text-base md:text-lg font-bold text-amber-400">Est. 2015</h3>
              <p className="text-slate-300 text-xs md:text-sm">
                A legacy of delicious obsession.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="text-left space-y-6"
          >
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-amber-500" />
              <h3 className="text-2xl md:text-3xl font-bold leading-snug">
                From Our Kitchen to Yours
              </h3>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed">
              What began as a personal obsession—toasting, spicing, and tasting until we found the perfect recipe—quickly became something we had to share. We believe that great snacks are an experience, a moment of pure, unadulterated joy.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed">
              We hunt down the boldest spices and finest all-natural ingredients. Every batch is crafted with the same passion and attention to detail as our very first. This isn&apos;t just business; it&apos;s our craft.
            </p>

            <Link href="/Products" passHref>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(245, 158, 11, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="inline-block mt-4 bg-amber-500 text-slate-900 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-amber-600 transition-all"
              >
                Explore Our Flavors
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OurStorySection;