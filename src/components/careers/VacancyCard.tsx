import { Vacancy } from "@/lib/types";
import { motion } from "framer-motion";
import { MapPin, Building } from "lucide-react";

// --- FIX: The interface MUST declare the onApplyNow prop ---
interface VacancyCardProps {
  vacancy: Vacancy;
  onApplyNow: (vacancy: Vacancy) => void;
}

const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

const VacancyCard = ({ vacancy, onApplyNow }: VacancyCardProps) => {
  return (
    <motion.div 
      variants={cardVariants}
      className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 flex flex-col h-full shadow-lg hover:border-cyan-500/70 transition-colors duration-300"
    >
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-white mb-1">{vacancy.title}</h3>
        <div className="flex items-center space-x-4 text-slate-400 mb-4 text-sm">
            <span className="flex items-center"><Building size={14} className="mr-1.5" />{vacancy.department}</span>
            <span className="flex items-center"><MapPin size={14} className="mr-1.5" />{vacancy.location}</span>
        </div>
        <div className="inline-block bg-cyan-800/50 text-cyan-200 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
            {vacancy.type}
        </div>
        <p className="text-slate-300 text-sm leading-relaxed h-24 overflow-y-auto custom-scrollbar">
            {vacancy.description}
        </p>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-700">
        <button
          onClick={() => onApplyNow(vacancy)}
          className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Apply Now
        </button>
      </div>
    </motion.div>
  );
};

export default VacancyCard;