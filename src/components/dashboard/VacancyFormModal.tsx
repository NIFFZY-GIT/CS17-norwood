'use client';

import { useState, FormEvent } from 'react';
import { Vacancy } from '@/lib/types';
import { Loader2, X } from 'lucide-react';

interface Props {
    vacancy: Vacancy | null; 
    onClose: () => void;
    onSave: () => void;
}

const VacancyFormModal = ({ vacancy, onClose, onSave }: Props) => {
    const [formData, setFormData] = useState({
        title: vacancy?.title || '',
        department: vacancy?.department || '',
        location: vacancy?.location || '',
        type: vacancy?.type || 'Full-time',
        description: vacancy?.description || '',
        isActive: vacancy?.isActive ?? true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const url = vacancy ? `/api/admin/vacancies/${vacancy._id}` : '/api/admin/vacancies';
        const method = vacancy ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'An error occurred.');
            }
            onSave();
        // FIX: Change 'any' to 'unknown' and perform a type check.
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{vacancy ? 'Edit Vacancy' : 'Add New Vacancy'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
                    <input name="title" value={formData.title} onChange={handleChange} placeholder="Job Title (e.g., Senior Developer)" required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="department" value={formData.department} onChange={handleChange} placeholder="Department (e.g., Engineering)" required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <input name="location" value={formData.location} onChange={handleChange} placeholder="Location (e.g., Remote)" required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    </div>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                    </select>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Job Description" required rows={6} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded" />
                        <span>Active (Visible on public careers page)</span>
                    </label>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-sky-600 text-white rounded-lg flex items-center justify-center disabled:bg-sky-400">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Vacancy'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VacancyFormModal;