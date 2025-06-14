"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Updated fetch URL to your Next.js API route
      const response = await fetch("/api/send-contact-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) { // Check response.ok as well
        toast.success("🎉 Message Sent Successfully!", { duration: 3000 });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(result.error || "❌ Failed to send message, please try again.");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("⚠️ An error occurred. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-20 bg-gradient-to-b from-black via-gray-900 to-black text-white"
    >
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-center mb-16"
        >
          Let&apos;s Connect
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Side - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8"
          >
            <h3 className="text-2xl sm:text-3xl font-semibold mb-6 text-green-600">
              Get in Touch
            </h3>
            <p className="text-gray-700 mb-8">
              Reach out for any inquiries or support. We&apos;re happy to hear from you!
            </p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <FaPhone className="text-green-500 text-2xl animate-pulse" />
                <a
                  href="tel:+94716195982"
                  className="text-gray-700 hover:text-green-600 text-lg transition"
                >
                  +94 716 195 982
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <FaEnvelope className="text-green-500 text-2xl animate-pulse" />
                <a
                  href="mailto:norwoodlankateasinternational@gmail.com"
                  className="text-gray-700 hover:text-green-600 text-lg transition break-words truncate max-w-full"
                >
                  norwoodlankateasinternational@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <FaMapMarkerAlt className="text-green-500 text-2xl animate-bounce" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Norwood+Empire(PVT)Ltd+Sri+Lanka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-green-600 text-lg transition"
                >
                  Norwood Empire (PVT) Ltd, Sri Lanka
                </a>
              </div>
            </div>

            {/* Google Map Embed */}
            <div className="mt-8 rounded-2xl overflow-hidden shadow-2xl border border-green-200 hover:scale-105 transform transition-all duration-500">
              <div className="w-full h-64 sm:h-60 md:h-45">
                <iframe
                  title="Google Map"
                  className="w-full h-full"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.159262690624!2d79.97885107568112!3d6.87151231901993!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2511ff4c2142b%3A0xc20797ac18fb760f!2sNorwood%20Empire%20(PVT)%20Ltd!5e0!3m2!1sen!2slk!4v1740077158463!5m2!1sen!2slk"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8"
          >
            <h3 className="text-2xl sm:text-3xl font-semibold mb-6 text-green-600">
              Send Us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-4 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              />

              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-4 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full p-4 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              />

              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full p-4 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition h-32"
              />

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default ContactUs;



