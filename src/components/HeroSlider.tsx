"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";

const allSlidesData = [
  // You can re-enable these image slides if you want a mixed-content slider
  // {
  //   id: 1,
  //   type: "image",
  //   image: "/allbitepackings.jpg",
  //   title: "THE BRAND",
  //   subtitle: "OF TEA AND BITE TASTE",
  // },
  {
    id: 2,
    type: "video",
    videoSrc: "/Norwood intro.mp4",
    title: "THE BRAND",
    subtitle: "OF TEA AND BITE TASTE",
  },
  // {
  //   id: 3,
  //   type: "image",
  //   image: "/magic purple.jpg",
  //   title: "DELICIOUS CRUNCH",
  //   subtitle: "BEST FOR TEA TIME",
  // },
];

const HeroSlider = () => {
  // Filter to get only video slides
  const videoSlides = allSlidesData.filter(slide => slide.type === "video");

  // Fallback if no video slides are available
  if (videoSlides.length === 0) {
    return (
      <div className="w-full h-[600px] md:h-[600px] lg:h-[700px] relative overflow-hidden flex items-center justify-center bg-gray-200">
        <p className="text-gray-500">No video content available.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] md:h-[600px] lg:h-[700px] relative overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={videoSlides.length > 1 ? { clickable: true } : false}
        loop={videoSlides.length > 1}
        className="h-full"
      >
        {videoSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative h-full w-full"
            >
              {slide.videoSrc && (
                <video
                  src={slide.videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  // ✅ THE FIX IS HERE
                  // This tells React to ignore differences between the server-rendered
                  // and client-rendered HTML for this specific element. This is the
                  // recommended way to handle issues caused by browser extensions.
                  suppressHydrationWarning={true}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center">
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="text-white px-6 sm:px-10 md:px-16 max-w-md md:max-w-lg lg:max-w-xl"
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                    {slide.title}
                  </h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="text-xl sm:text-2xl mt-3 text-yellow-400"
                  >
                    {slide.subtitle}
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSlider;