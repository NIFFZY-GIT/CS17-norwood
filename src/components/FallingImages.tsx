"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const imageSrc = "/bite1.png"; // Ensure this image is inside public/

const FallingImages = () => {
  const [fallingImages, setFallingImages] = useState<
    { id: string; left: number; size: number; delay: number; rotationSpeed: number }[]
  >([]);
  const [hasDropped, setHasDropped] = useState(false); // Track if an image has dropped for the current scroll

  useEffect(() => {
    const handleScroll = () => {
      if (!hasDropped) { // Only drop an image if none has been dropped for this scroll
        setFallingImages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`, // Unique ID
            left: Math.random() * 100, // Random horizontal position (0% to 100%)
            size: Math.random() * 50 + 50, // Random size (50px to 100px)
            delay: Math.random() * 1.5, // Small delay before falling
            rotationSpeed: Math.random() * 150 + 50, // Random rotation speed
          },
        ]);
        setHasDropped(true); // Mark that an image has been dropped for this scroll
      }
    };

    const resetDropFlag = () => {
      setHasDropped(false); // Reset the flag when scrolling stops
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("scrollend", resetDropFlag); // Reset the flag when scrolling ends

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scrollend", resetDropFlag);
    };
  }, [hasDropped]);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-50">
      {fallingImages.map(({ id, left, size, delay, rotationSpeed }) => (
        <FallingImage key={id} left={left} size={size} delay={delay} rotationSpeed={rotationSpeed} />
      ))}
    </div>
  );
};

const FallingImage = ({ left, size, delay, rotationSpeed }: { left: number; size: number; delay: number; rotationSpeed: number }) => {
  return (
    <motion.img
      src={imageSrc}
      alt="Falling PNG"
      className="absolute object-contain"
      style={{ width: `${size}px`, height: `${size}px` }} // Dynamic size
      initial={{ y: "-10vh", left: `${left}vw`, rotate: 0 }} // Start above viewport
      animate={{ 
        y: "110vh", 
        rotate: [0, rotationSpeed], // Continuous rotation
      }} 
      transition={{ 
        duration: 6, // Falling duration
        delay, 
        ease: [0.22, 1, 0.36, 1] // Smooth easing
      }} 
    />
  );
};

export default FallingImages;