"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ServerCrash, Briefcase } from "lucide-react";
import { Vacancy } from "@/lib/types";
import VacancyRow from "@/components/careers/VacancyRow";
import ApplicationFormModal from "@/components/careers/ApplicationFormModal";

const CareersPage = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  
  useEffect(() => {
    const fetchVacancies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/vacancies");
        if (!res.ok) throw new Error(`Failed to fetch vacancies: ${res.status}`);
        const data: Vacancy[] = await res.json();
        setVacancies(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchVacancies();
  }, []);

  const handleApplyNow = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
  };

  const handleCloseModal = () => {
    setSelectedVacancy(null);
  };

  // --- FIX APPLIED HERE ---
  const pageContainerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
  } as const;

  // --- FIX APPLIED HERE ---
  const heroTextVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "circOut" } },
  } as const;

  return (
    <>
      <AnimatePresence>
        {selectedVacancy && (
          <ApplicationFormModal
            vacancy={selectedVacancy}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>

      <motion.section
        variants={pageContainerVariants}
        initial="initial"
        animate="animate"
        className="relative min-h-screen overflow-x-hidden bg-slate-950 text-white"
      >
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_70%,#4c1d95AA_0%,#1e293b00_30%),radial-gradient(circle_at_70%_30%,#0f766eAA_0%,#1e293b00_25%)]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center mb-20 md:mb-28">
            <motion.h1
              variants={heroTextVariants}
              className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-cyan-300 to-sky-400"
            >
              Join Our Team
            </motion.h1>
            <motion.p
              variants={heroTextVariants}
              // You can't have a transition prop directly here when using variants
              // The transition is defined inside the variant itself.
              // So, I am commenting this line out to prevent potential issues.
              // transition={{ delay: 0.3 }} 
              className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto"
            >
              Discover your next career opportunity and help us build the future. We are looking for passionate and talented individuals.
            </motion.p>
          </div>

          <motion.div
            variants={heroTextVariants}
            // Same as above, transition should be in the variant, not here.
            // transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">Open Positions</h2>
            <div className="mt-2 h-1 w-20 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full"></div>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
                 <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col justify-center items-center h-60 text-slate-400">
                    <Loader2 className="animate-spin text-cyan-500 mb-6" size={64} />
                    <p className="text-2xl tracking-wider font-medium">Finding Opportunities...</p>
                </motion.div>
            ) : error ? (
                 <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 px-8 bg-red-900/50 rounded-xl max-w-lg mx-auto border border-red-700/50">
                    <ServerCrash size={60} className="mx-auto text-red-300 mb-5" />
                    <h2 className="text-2xl font-semibold text-red-200 mb-3">Connection Lost</h2>
                    <p className="text-red-300/90">{error}</p>
                </motion.div>
            ) : vacancies.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 text-slate-400">
                    <Briefcase size={80} className="mx-auto text-cyan-500/50 mb-8" />
                    <h2 className="text-3xl font-semibold mb-4 text-slate-200">No Open Positions Currently</h2>
                    <p className="text-lg text-slate-500">We are always looking for talent. Check back soon!</p>
                </motion.div>
            ) : (
              <motion.div
                key="vacanciesList"
                className="flex flex-col gap-4"
                variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
              >
                {vacancies.map((vacancy) => (
                  <VacancyRow key={vacancy._id} vacancy={vacancy} onApplyNow={handleApplyNow} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </>
  );
};

export default CareersPage;