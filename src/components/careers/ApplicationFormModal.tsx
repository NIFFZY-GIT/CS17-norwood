"use client";

import { useState, FormEvent, useRef } from 'react';
import { motion } from 'framer-motion';
import { Vacancy } from '@/lib/types';
import { Loader2, X, CheckCircle, AlertTriangle, UploadCloud, FileText } from 'lucide-react';

interface Props {
  vacancy: Vacancy;
  onClose: () => void;
}

const ApplicationFormModal = ({ vacancy, onClose }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cvFile || !agreedTerms || !agreedPrivacy) {
        setError("Please upload a CV and agree to the terms.");
        return;
    }
    setError(null);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append('vacancyId', vacancy._id);
    formData.append('vacancyTitle', vacancy.title);
    formData.append('cv', cvFile);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Submission failed.');
      }

      setSuccess(true);
    // FIX: Change 'any' to 'unknown' and perform a type check.
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during submission.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setError("File size should not exceed 5MB.");
          return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
          setError("Invalid file type. Please upload a PDF or Word document.");
          return;
      }
      setError(null);
      setCvFile(file);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <X size={24} />
        </button>

        <div className="p-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Apply for {vacancy.title}</h2>
                <p className="text-slate-400 mt-1">{vacancy.department} - {vacancy.location}</p>
            </div>
            
            {success ? (
                <div className="text-center py-10">
                    <CheckCircle className="mx-auto text-green-400 mb-4" size={60} />
                    <h3 className="text-xl font-semibold text-white">Application Sent!</h3>
                    <p className="text-slate-300 mt-2">Thank you for your interest. We will be in touch if you are a good fit.</p>
                    <button onClick={onClose} className="mt-6 bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg">Close</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <input type="text" name="fullName" placeholder="Full Name" required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    <input type="email" name="email" placeholder="Email Address" required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    <input type="tel" name="phone" placeholder="Phone Number" required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Upload CV (PDF, DOC, DOCX - Max 5MB)</label>
                        <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors">
                            <input type="file" name="cv" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" required />
                            {cvFile ? (
                                <div className="text-green-400 flex items-center justify-center">
                                    <FileText className="mr-2" /> <span>{cvFile.name}</span>
                                </div>
                            ) : (
                                <div className="text-slate-500">
                                    <UploadCloud className="mx-auto mb-2" size={32} />
                                    <span>Click to browse or drag & drop</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <label className="flex items-start text-sm text-slate-400">
                            <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} className="mt-1 mr-3 h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500" />
                            <span>I agree to the <a href="/terms" target="_blank" className="text-cyan-400 hover:underline">Terms and Conditions</a>.</span>
                        </label>
                        <label className="flex items-start text-sm text-slate-400">
                            <input type="checkbox" checked={agreedPrivacy} onChange={(e) => setAgreedPrivacy(e.target.checked)} className="mt-1 mr-3 h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500" />
                            <span>I agree to the <a href="/privacy" target="_blank" className="text-cyan-400 hover:underline">Privacy Policy</a>.</span>
                        </label>
                    </div>

                    {error && (
                        <div className="text-red-400 bg-red-900/50 p-3 rounded-lg flex items-center text-sm">
                            <AlertTriangle className="mr-2 flex-shrink-0" size={16}/> {error}
                        </div>
                    )}
                    
                    <button type="submit" disabled={isSubmitting || !agreedTerms || !agreedPrivacy} className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Application"}
                    </button>
                </form>
            )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ApplicationFormModal;