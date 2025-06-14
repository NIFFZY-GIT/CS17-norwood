"use client";

import { motion } from "framer-motion";


const WhoWeAre = () => {
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
            Welcome to our sales and marketing company, where we specialize in helping
            customers snag great deals from the leading solar and cable companies in the
            DC, Maryland, and Virginia area. We understand that finding the right solar and
            cable solutions for your needs can be a daunting task, which is why we’re here
            to make the process easier and more affordable for you.
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
              className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-full shadow-md hover:bg-gray-200 transition"
            >
              Read More
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-3 bg-black text-white font-semibold rounded-full shadow-md hover:bg-gray-800 transition"
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
            src="/people1.jpg"
            alt="Team"
            className="w-3/4 rounded-lg shadow-lg"
          />
          <motion.img
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.1, rotate: 2 }}
            src="/people2.jpg"
            alt="Customer Interaction"
            className="absolute bottom-0 right-0 w-1/2 rounded-lg shadow-lg border-4 border-white"
          />
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
