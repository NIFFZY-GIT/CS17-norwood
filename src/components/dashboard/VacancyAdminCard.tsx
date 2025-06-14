import { Vacancy } from "@/lib/types";
import { Briefcase, MapPin, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

// --- CHECK 3: VERIFY THIS INTERFACE ---
// It MUST define 'onEdit' and 'onDelete'.
interface Props {
    vacancy: Vacancy;
    onEdit: () => void;
    onDelete: () => void;
}

const VacancyAdminCard = ({ vacancy, onEdit, onDelete }: Props) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{vacancy.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center"><Briefcase size={14} className="mr-1.5"/>{vacancy.department}</span>
                    <span className="flex items-center"><MapPin size={14} className="mr-1.5"/>{vacancy.location}</span>
                </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                 <div className={`flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                     vacancy.isActive 
                     ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                     : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                 }`}>
                    {vacancy.isActive ? <ToggleRight size={16} className="mr-1.5"/> : <ToggleLeft size={16} className="mr-1.5"/>}
                    {vacancy.isActive ? 'Active' : 'Inactive'}
                </div>
                <button onClick={onEdit} className="p-2 text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 transition-colors"><Pencil size={18} /></button>
                <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
            </div>
        </div>
    );
};

export default VacancyAdminCard;