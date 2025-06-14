"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const brands = [
  { id: 1, image: "/cocont loo.png", alt: "Laska Tea" },
  { id: 2, image: "/lasa logo.png", alt: "Coconut Rock" },
  { id: 3, image: "/magic masa.png", alt: "Magic" },
  { id: 4, image: "/milk t logo.png", alt: "Milk Toffee" },
  { id: 5, image: "/magic2.png", alt: "Magic 2" },
];

const OurBrands = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold text-gray-900 mb-12"
        >
          Our Brands
        </motion.h2>

        {/* Brand Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.1, rotate: 3 }}
              className="flex items-center justify-center w-40 md:w-52"
            >
              <Image
                src={brand.image}
                alt={brand.alt}
                width={150}
                height={100}
                className="w-full h-auto drop-shadow-xl transition-transform duration-300 ease-in-out"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurBrands;
