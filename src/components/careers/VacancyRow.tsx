import { Vacancy } from "@/lib/types";
import { motion } from "framer-motion";
import { MapPin, Building, Briefcase, ChevronRight } from "lucide-react";

interface VacancyRowProps {
  vacancy: Vacancy;
  onApplyNow: (vacancy: Vacancy) => void;
}

const rowVariants = {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const VacancyRow = ({ vacancy, onApplyNow }: VacancyRowProps) => {
  return (
    <motion.div 
      variants={rowVariants}
      className="group"
    >
      <button
        onClick={() => onApplyNow(vacancy)}
        className="w-full text-left p-6 bg-slate-900 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 ease-in-out hover:bg-slate-800/80 hover:border-cyan-400/60 hover:shadow-xl hover:shadow-cyan-500/10"
      >
        {/* Left Side: Job Title & Description */}
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-white transition-colors duration-300 group-hover:text-cyan-300">
            {vacancy.title}
          </h3>
          <p className="text-slate-400 text-sm mt-1 line-clamp-2">
            {vacancy.description}
          </p>
        </div>
        
        {/* Middle: Metadata Tags */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 w-full md:w-auto md:justify-end">
            <div className="flex items-center text-sm text-slate-300">
                <Building size={14} className="mr-1.5 text-slate-500" />
                {vacancy.department}
            </div>
            <div className="flex items-center text-sm text-slate-300">
                <MapPin size={14} className="mr-1.5 text-slate-500" />
                {vacancy.location}
            </div>
            <div className="flex items-center text-sm text-slate-300">
                <Briefcase size={14} className="mr-1.5 text-slate-500" />
                {vacancy.type}
            </div>
        </div>
        
        {/* Right Side: Apply Chevron */}
        <div className="hidden md:flex items-center justify-center pl-4 border-l border-slate-700/50">
           <ChevronRight className="w-7 h-7 text-slate-500 transition-transform duration-300 group-hover:text-cyan-400 group-hover:translate-x-1" />
        </div>
      </button>
    </motion.div>
  );
};

export default VacancyRow;