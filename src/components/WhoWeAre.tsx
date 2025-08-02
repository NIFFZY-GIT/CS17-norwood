"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const WhoWeAre = () => {
  const router = useRouter();

  return (
    <section className="py-16 bg-gradient-to-r from-yellow-500 to-orange-500">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-10">

        {/* Left Side - Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2 text-white"
        >
          <h2 className="text-5xl font-extrabold mb-4">Who We Are</h2>
          <p className="text-lg leading-relaxed">
            <b>Welcome to Norwood Empire (PVT) LTD</b>, your trusted partner for authentic Sri Lankan tea and snacks. Established in 2015, we bring over 10 years of experience in crafting delicious products using unique, time-honored Sri Lankan recipes. We take pride in delivering quality and taste that capture the true essence of our island’s rich culinary heritage.
            Whether you’re craving a soothing cup of tea or a flavorful snack, we’re here to share a little taste of Sri Lanka with you — wherever you are.
          </p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-3 bg-black text-white font-semibold rounded-full shadow-md hover:bg-gray-800 transition"
              onClick={() => router.push("/Contact-Us")}
            >
              Contact us today
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Side - Images */}
        <div className="lg:w-1/2 flex relative">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
            src="/t1.png"
            alt="Team"
            className="w-3/4 rounded-lg shadow-lg"
          />
          <motion.img
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.1, rotate: 2 }}
            src="/c2.png"
            alt="Customer Interaction"
            className="absolute bottom-0 right-0 w-1/2 rounded-lg shadow-lg border-4 border-white"
          />
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
