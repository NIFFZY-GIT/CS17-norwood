"use client";

import { motion } from "framer-motion";

const features = [
  {
    id: "01",
    title: "Expertise & Experience", // Shorter title
    description:
      "With 10 years in the food industry, we deliver products meeting the highest standards of quality, safety, and taste.", // Slightly more concise
    // No explicit bgColor/textColor, will use defaults
  },
  {
    id: "02",
    title: "Authentic & Unique Flavors",
    description:
      "Our recipes bring authentic, unique flavors that resonate, making every bite a delightful experience for your customers.",
    bgColor: "bg-green-700", // Modern accent for highlight
    textColor: "text-white",
    highlight: true,
  },
  {
    id: "03",
    title: "Reasonable Pricing",
    description:
      "We offer high-quality products at reasonable prices, ensuring excellent value without compromising on quality.",
  },
  {
    id: "04",
    title: "Superior Quality & Freshness",
    description:
      "Using only the finest, freshest ingredients from trusted suppliers, our products excel in taste and nutritional value.",
  },
  {
    id: "05",
    title: "Proven Trust & Reliability",
    description:
      "Long-standing client partnerships and consistent quality make us a reliable choice in the food industry.",
  },
];

const WhyChoose = () => {
  return (
    <section className="py-20 md:py-28 bg-slate-50"> {/* Cleaner background, more padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Standard padding */}
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }} // Animate when in view
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-12 md:mb-16 text-center mx-auto" // Increased bottom margin
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight"> {/* Adjusted font, tracking */}
            Why Choose Our Products?
          </h2>
          <p className="text-slate-600 mt-4 text-lg md:text-xl leading-relaxed"> {/* Adjusted font size, leading */}
            Whether you’re looking for premium quality, unique flavors, or reliability, we’ve got you covered.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Responsive columns */}
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} // Animate when in view
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: feature.highlight 
                  ? "0px 20px 35px -10px rgba(76, 81, 191, 0.4)" // Custom shadow for highlighted
                  : "0px 15px 30px -10px rgba(0,0,0,0.15)"  // Softer shadow for default
              }}
              className={`p-8 rounded-xl transition-all transform flex flex-col ${ // More padding, rounded-xl, flex for alignment
                feature.highlight
                  ? `${feature.bgColor} ${feature.textColor} shadow-xl` // Prominent shadow for highlighted
                  : "bg-white text-slate-700 shadow-lg border border-slate-200/70" // Default card style
              }`}
            >
              {/* Animated Number - Styled as an accent */}
              <motion.span
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
                className={`text-5xl font-bold mb-5 ${ // Adjusted size and margin
                  feature.highlight ? "text-white/80" : "text-green-700" // Accent color for number
                }`}
              >
                {feature.id}
              </motion.span>

              <h3 className={`text-xl font-semibold mb-3 ${ // Adjusted font size/weight
                feature.highlight ? "text-white" : "text-slate-800"
              }`}>
                {feature.title}
              </h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
                className={`text-base leading-relaxed ${ // Standard text size, relaxed leading
                  feature.highlight ? "text-indigo-100" : "text-slate-600"
                }`}
              >
                {feature.description}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;