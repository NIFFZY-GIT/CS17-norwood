"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // ✅ Correct spelling

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 px-4 md:px-6 overflow-hidden relative">

      {/* 🍃 Leaves + 🦋 Butterflies */}
      <Particles
        className="absolute inset-0 z-0"
        init={async (main) => {
          await loadSlim(main);
        }}
        options={{
          fullScreen: { enable: false },
          background: { color: "transparent" },
          interactivity: {
            events: {
              onHover: { enable: false },
              onClick: { enable: false },
            },
          },
          particles: {
            number: { value: 15 },
            shape: {
              type: "image",
              image: [
                { src: "/leaf_freen.png", width: 32, height: 32 },
                { src: "/leaf_brown.png", width: 32, height: 32 },
        
              ],
            },
            size: { value: { min: 20, max: 40 } },
            move: {
              enable: true,
              gravity: { enable: true, acceleration: 0.3 }, // gentle fall for leaves
              direction: "bottom",
              outModes: { default: "out" },
              speed: { min: 0.2, max: 1.5 }, // leaves slow, butterflies faster
              straight: false,
              random: true,
              path: {
                enable: true,
                options: {
                  clamp: false,
                  delay: { min: 0.2, max: 0.5 },
                },
              },
            },
            rotate: {
              value: { min: 0, max: 360 },
              direction: "random",
              animation: {
                enable: true,
                speed: 5,
                sync: false,
              },
            },
            opacity: {
              value: { min: 0.5, max: 1 },
            },
          },
        }}
      />

  
    

      {/* Animated 404 Text */}
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-6xl md:text-[100px] font-extrabold text-green-700 mb-4 drop-shadow-lg z-10 select-none text-center"
      >
        404
      </motion.h1>

      {/* Smooth Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-xl md:text-2xl text-green-900 mb-6 text-center z-10"
      >
        Lost deep in the forest of snacks 🌲🍪
      </motion.p>

      {/* Typing Effect */}
      <motion.p
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="overflow-hidden whitespace-nowrap border-r-2 border-green-600 text-lg text-green-800 mb-10 z-10"
      >
        Looking for a way back to the snack trail...
      </motion.p>
      {/* Button */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 3 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="z-10"
      >
        <Link href="/">
          <button className="px-6 md:px-10 py-3 md:py-4 bg-green-600 text-white text-base md:text-lg rounded-full shadow-lg hover:bg-green-700 transition duration-300">
            Return Home
          </button>
        </Link>
      </motion.div>

      {/* Fun Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ repeat: Infinity, duration: 3, repeatType: "reverse" }}
        className="mt-12 text-xs md:text-sm text-green-700 z-10 text-center"
      >
        Don’t worry, a cookie 🍪 will guide you back!
      </motion.p>
    </div>
  );
}
