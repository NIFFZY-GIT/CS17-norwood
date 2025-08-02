"use client";

import Image from "next/image";

const services = [
  {
    id: 1,
    title: "Retail Selling",
    description: "We sell our products to Shops and outlets where customers can visit.",
    image: "/i1.png", // Replace with actual image paths
  },
  {
    id: 2,
    title: "Online Orders",
    description: "We sell our products through website and customers can place their order online.",
    image: "/i2.png",
  },
  {
    id: 3,
    title: "Selling Agencies",
    description: "We sell our agencies to business partners who have the ability to maintain the agency and do the sales under our company control.",
    image: "/i3.png",
  },
  {
    id: 4,
    title: "Careers and Opportunity",
    description: "Unlock your potential with career paths designed for growth, innovation, and impact. Explore opportunities that empower you to thrive and make a difference.",
    image: "/c1.png",
  },
];

const Services = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-10">Our Services</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.id} className="relative group overflow-hidden rounded-lg shadow-lg">
              <Image
                src={service.image}
                alt={service.title}
                width={300}
                height={400}
                className="w-full h-[350px] object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-6 text-white">
                <h3 className="text-lg font-bold">{service.title}</h3>
                <p className="text-sm mt-2">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
