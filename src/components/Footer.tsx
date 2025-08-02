"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
// Added more icons from lucide-react for the new section
import { Flame, Leaf, ShieldCheck, Heart } from 'lucide-react';

const navLinks = [
   { name: "Home", href: "/" },
   { name: "Products", href: "/Products" },
  { name: "Our Story", href: "/Our-Story" },
  { name: "Our Companies", href: "/Our-Companies" },
  { name: "Careers", href: "/Careers" },
   { name: "Contact Us", href: "/Contact-Us" },
];

const socialLinks = [
  { icon: FaFacebookF, href: "https://www.facebook.com/norwoodteasinternational", label: "Facebook" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
  { icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
];

// Data for the new "Our Values" section
const ourValues = [
    {
        icon: Leaf,
        title: "Authentic Roots",
        description: "Inspired by traditional Sri Lankan recipes and ingredients."
    },
    {
        icon: ShieldCheck,
        title: "Uncompromising Quality",
        description: "Crafted in small batches to ensure freshness and flavor."
    },
    {
        icon: Heart,
        title: "Made with Passion",
        description: "A family-run business built on a love for great food."
    }
]

const Footer = () => {
  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.footer
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-slate-950 text-slate-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Updated grid for four sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <motion.div variants={itemVariants}>
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Flame className="w-8 h-8 text-amber-500" />
              <span className="text-2xl font-black text-white">
                Norwood Empire
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed">
              Crafting authentic Sri Lankan flavors with passion and tradition.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-amber-400 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* NEW SECTION: Our Values */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-white mb-4">Our Values</h3>
            <ul className="space-y-4">
              {ourValues.map((value) => (
                <li key={value.title} className="flex items-start gap-3">
                    <value.icon className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-white">{value.title}</p>
                        <p className="text-sm text-slate-400">{value.description}</p>
                    </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants}>
             <h3 className="text-lg font-bold text-white mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="text-slate-400 hover:text-amber-400 transition-colors duration-300"
                  >
                    <social.icon size={24} />
                  </motion.a>
                ))}
              </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-500 text-sm">
          <p>
            © {new Date().getFullYear()} Norwood Empire (PVT) Ltd. All Rights
            Reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;